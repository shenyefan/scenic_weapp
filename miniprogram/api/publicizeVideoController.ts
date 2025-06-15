// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/publicize/video/add */
export async function addPublicizeVideo(
  body: API.PublicizeVideoAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/publicize/video/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/publicize/video/delete */
export async function deletePublicizeVideo(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/publicize/video/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/publicize/video/get/vo */
export async function getPublicizeVideoVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPublicizeVideoVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePublicizeVideoVO>(
    "/api/publicize/video/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/publicize/video/list/page */
export async function listPublicizeVideoByPage(
  body: API.PublicizeVideoQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeVideo>(
    "/api/publicize/video/list/page",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/publicize/video/list/page/vo */
export async function listPublicizeVideoVoByPage(
  body: API.PublicizeVideoQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeVideoVO>(
    "/api/publicize/video/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/publicize/video/my/list/page/vo */
export async function listMyPublicizeVideoVoByPage(
  body: API.PublicizeVideoQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeVideoVO>(
    "/api/publicize/video/my/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/publicize/video/update */
export async function updatePublicizeVideo(
  body: API.PublicizeVideoUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/publicize/video/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
