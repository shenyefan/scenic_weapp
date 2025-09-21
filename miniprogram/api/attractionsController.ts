// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/attractions/add */
export async function addAttractions(
  body: API.AttractionsAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/attractions/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/attractions/delete */
export async function deleteAttractions(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/attractions/get/vo */
export async function getAttractionsVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAttractionsVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAttractionsVO>("/api/attractions/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/attractions/list/page */
export async function listAttractionsByPage(
  body: API.AttractionsQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAttractions>(
    "/api/attractions/list/page",
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

/** 此处后端没有提供注释 POST /api/attractions/list/page/vo */
export async function listAttractionsVoByPage(
  body: API.AttractionsQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAttractionsVO>(
    "/api/attractions/list/page/vo",
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

/** 此处后端没有提供注释 POST /api/attractions/update */
export async function updateAttractions(
  body: API.AttractionsUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
