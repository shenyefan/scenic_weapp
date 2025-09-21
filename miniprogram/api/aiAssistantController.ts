// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/ai/chat */
export async function chat(
  body: API.AiChatRequest,
  options?: { [key: string]: any }
) {
  return request<string[]>("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
