import { createOpenAI } from "@ai-sdk/openai";

export function inferaftProvider() {
  return createOpenAI({
    apiKey: process.env.INFERAFT_API_KEY || "missing",
    baseURL: process.env.INFERAFT_API_URL || "https://inferaft.com/v1",
    name: "inferaft",
  });
}

export function inferaftModel() {
  return inferaftProvider()(process.env.INFERAFT_CHAT_MODEL || "qwen-3.8-27b");
}
