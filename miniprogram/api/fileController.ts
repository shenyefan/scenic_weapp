import request from "../utils/request";


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
