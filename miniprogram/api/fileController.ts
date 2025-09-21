// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/file/upload */
export async function uploadFile(
  body: {
    biz: string;
  },
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString>("/api/file/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
