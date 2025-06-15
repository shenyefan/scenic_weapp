// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/publicize/wx/add */
export async function addPublicizeWxPlatform(
  body: API.PublicizeWxPlatformAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/publicize/wx/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/publicize/wx/delete */
export async function deletePublicizeWxPlatform(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/publicize/wx/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/publicize/wx/get/vo */
export async function getPublicizeWxPlatformVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getPublicizeWxPlatformVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePublicizeWxPlatformVO>(
    "/api/publicize/wx/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/publicize/wx/list/page */
export async function listPublicizeWxPlatformByPage(
  body: API.PublicizeWxPlatformQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeWxPlatform>(
    "/api/publicize/wx/list/page",
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

/** 此处后端没有提供注释 POST /api/publicize/wx/list/page/vo */
export async function listPublicizeWxPlatformVoByPage(
  body: API.PublicizeWxPlatformQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeWxPlatformVO>(
    "/api/publicize/wx/list/page/vo",
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

/** 此处后端没有提供注释 POST /api/publicize/wx/my/list/page/vo */
export async function listMyPublicizeWxPlatformVoByPage(
  body: API.PublicizeWxPlatformQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePagePublicizeWxPlatformVO>(
    "/api/publicize/wx/my/list/page/vo",
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

/** 此处后端没有提供注释 POST /api/publicize/wx/update */
export async function updatePublicizeWxPlatform(
  body: API.PublicizeWxPlatformUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/publicize/wx/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
