import { streamText } from "ai";
import { z } from "zod";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { activateLore } from "@/lib/lorebook";
import { buildSystemPrompt } from "@/lib/prompt";
import { inferaftModel } from "@/lib/inferaft";
import { ensureMemory, getLongTermMemory, persistTurn } from "@/lib/memory";
import { mockReply } from "@/lib/mock";
import { maybeUpdateSummaries } from "@/lib/summaries";
import type { Character, LoreEntry } from "@/lib/types";

const Body=z.object({conversationId:z.string().uuid(),message:z.string().trim().min(1).max(12000)});

export async function POST(req:Request){ const session=await auth.api.getSession({headers:await headers()}); if(!session)return new Response('unauthorized',{status:401});
 const parsed=Body.safeParse(await req.json()); if(!parsed.success)return new Response('invalid body',{status:400}); const {conversationId,message}=parsed.data;
 const convoQ=await db.query(`select c.*, row_to_json(ch.*) character from conversation c join character ch on ch.id=c.character_id where c.id=$1 and c.user_id=$2`,[conversationId,session.user.id]); if(!convoQ.rows[0])return new Response('not found',{status:404}); const convo=convoQ.rows[0]; const character=convo.character as Character;
 await db.query(`insert into message(conversation_id,role,content) values($1,'user',$2)`,[conversationId,message]);
 const recentQ=await db.query(`select role,content from message where conversation_id=$1 order by id desc limit $2`,[conversationId,Number(process.env.RECENT_MESSAGE_LIMIT||14)]); const recent=[...recentQ.rows].reverse();
 const loreQ=await db.query(`select le.*, lb.scan_depth,lb.token_budget from lorebook_entry le join lorebook lb on lb.id=le.lorebook_id where lb.character_id=$1`,[character.id]); const entries=loreQ.rows as LoreEntry[]; const scanDepth=Number(loreQ.rows[0]?.scan_depth||8); const scanText=recent.slice(-scanDepth).map(x=>x.content).join('\n'); const active=activateLore(entries,scanText,Number(loreQ.rows[0]?.token_budget||1200));
 const notesQ=await db.query(`select content from memory_note where conversation_id=$1 and kind in ('pinned','state') order by updated_at desc`,[conversationId]);
 const personaQ=convo.persona_id?await db.query(`select name,description from persona where id=$1 and user_id=$2`,[convo.persona_id,session.user.id]):{rows:[]}; const persona=personaQ.rows[0]||{name:session.user.name||'User',description:''};
 await ensureMemory({userId:session.user.id,threadId:convo.zep_thread_id,name:session.user.name||'',email:session.user.email,characterName:character.name}); const longTerm=await getLongTermMemory(convo.zep_thread_id);
 const system=buildSystemPrompt({character,personaName:persona.name,personaDescription:persona.description,beforeLore:active.filter(x=>x.position==='before_char'),afterLore:active.filter(x=>x.position!=='before_char'),currentSceneSummary:convo.current_scene_summary,narrativeSummary:convo.narrative_summary,pinnedMemory:notesQ.rows.map(x=>x.content),longTermMemory:longTerm});
 if(process.env.INFERAFT_MOCK==='true'||!process.env.INFERAFT_API_KEY){const text=mockReply(character.name,message);await db.query(`insert into message(conversation_id,role,content) values($1,'assistant',$2)`,[conversationId,text]);await persistTurn(convo.zep_thread_id,message,text);return new Response(text,{headers:{'content-type':'text/plain; charset=utf-8'}});}
 const result=streamText({model:inferaftModel(),system,messages:recent.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content})),onFinish:async({text})=>{await db.query(`insert into message(conversation_id,role,content) values($1,'assistant',$2)`,[conversationId,text]);await db.query(`update conversation set updated_at=now() where id=$1`,[conversationId]);await persistTurn(convo.zep_thread_id,message,text);await maybeUpdateSummaries(conversationId);}});
 return result.toTextStreamResponse(); }
