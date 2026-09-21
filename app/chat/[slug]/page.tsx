import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import ChatClient from "./chat-client";

export default async function ChatPage({params}:{params:Promise<{slug:string}>}){ const session=await requireSession(); const {slug}=await params;
 const {rows}=await db.query('select * from character where slug=$1 and is_public=true limit 1',[slug]); if(!rows[0]) notFound(); const c=rows[0];
 let convo=await db.query('select * from conversation where user_id=$1 and character_id=$2 order by updated_at desc limit 1',[session.user.id,c.id]);
 if(!convo.rows[0]) { convo=await db.query(`insert into conversation(user_id,character_id,zep_thread_id,title) values($1,$2,$3,$4) returning *`,[session.user.id,c.id,crypto.randomUUID(),`${c.name}와의 대화`]); await db.query(`insert into message(conversation_id,role,content) values($1,'assistant',$2)`,[convo.rows[0].id,c.first_message]); }
 const messages=await db.query(`select id,role,content,created_at from message where conversation_id=$1 order by id asc limit 200`,[convo.rows[0].id]);
 return <ChatClient character={{id:c.id,name:c.name,tagline:c.tagline,avatarGradient:c.avatar_gradient}} conversationId={convo.rows[0].id} initialMessages={messages.rows.map(m=>({id:String(m.id),role:m.role,content:m.content}))}/>; }
