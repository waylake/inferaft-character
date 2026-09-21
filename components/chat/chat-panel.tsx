"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Sparkles } from "lucide-react";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export type ChatMessage = { id: string; role: "user" | "assistant" | "system"; content: string };

export function ChatPanel({
  character,
  conversationId,
  initialMessages,
}: {
  character: { name: string; imageUrl: string };
  conversationId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const streamingId = useRef<string | null>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setBusy(true);
    const user: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const replyId = crypto.randomUUID();
    streamingId.current = replyId;
    setMessages((current) => [...current, user, { id: replyId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });
      if (!response.ok) throw new Error((await response.text()) || `HTTP ${response.status}`);
      const reader = response.body?.getReader();
      if (!reader) throw new Error("스트림을 열 수 없습니다");

      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) => (message.id === replyId ? { ...message, content: acc } : message)),
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "알 수 없는 오류";
      toast.error("답변을 받지 못했습니다", { description: message });
      setMessages((current) => current.filter((entry) => entry.id !== replyId || entry.content.length > 0));
    } finally {
      streamingId.current = null;
      setBusy(false);
    }
  }

  const streaming = messages.find((message) => message.id === streamingId.current);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MessageScrollerProvider>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="mx-auto flex w-full max-w-3xl flex-col justify-end px-4 py-6">
              {messages.map((message) => (
                <MessageScrollerItem key={message.id}>
                  {message.role === "system" ? (
                    <Marker>
                      <MarkerContent>{message.content}</MarkerContent>
                    </Marker>
                  ) : message.role === "user" ? (
                    <Message align="end">
                      <MessageContent>
                        <Bubble>
                          <BubbleContent className="whitespace-pre-wrap">{message.content}</BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  ) : (
                    <Message>
                      <MessageAvatar>
                        <Avatar>
                          <AvatarImage src={character.imageUrl} alt="" />
                          <AvatarFallback>{character.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        <Bubble variant="muted">
                          <BubbleContent className="whitespace-pre-wrap">
                            {message.content}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  )}
                </MessageScrollerItem>
              ))}
              {busy && !streaming?.content && (
                <Marker role="status">
                  <MarkerContent className="shimmer">
                    <Sparkles className="size-3.5" /> {character.name}이(가) 장면을 이어가는 중…
                  </MarkerContent>
                </Marker>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <Separator />
      <div className="p-3 sm:p-4">
        <form onSubmit={send} className="mx-auto w-full max-w-3xl">
          <InputGroup>
            <InputGroupTextarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder={`${character.name}에게 메시지 보내기`}
              aria-label="메시지"
              rows={1}
              className="max-h-40 min-h-11 py-3"
            />
            <InputGroupAddon align="block-end">
              <p className="text-[11px] text-muted-foreground">
                Enter 전송 · Shift+Enter 줄바꿈 · 등장인물은 사용자를 대신해 말하지 않습니다
              </p>
              <InputGroupButton
                type="submit"
                size="icon-sm"
                variant="default"
                className="ml-auto"
                disabled={busy || !input.trim()}
                aria-label="전송"
              >
                <ArrowUp />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
        <div className="mx-auto mt-2 flex w-full max-w-3xl items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Inferaft 추론 · 가상의 대화입니다</p>
          <Button variant="ghost" size="xs" asChild>
            <Link href="/characters">다른 캐릭터</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
