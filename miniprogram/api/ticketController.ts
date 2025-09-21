// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/ticket/add */
export async function addTicket(
  body: API.TicketAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/ticket/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/ticket/delete */
export async function deleteTicket(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/ticket/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/ticket/get */
export async function getTicketById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTicketByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTicket>("/api/ticket/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/ticket/get/vo */
export async function getTicketVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTicketVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTicketVO>("/api/ticket/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/ticket/list/page */
export async function listTicketByPage(
  body: API.TicketQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTicket>("/api/ticket/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/ticket/list/page/vo */
export async function listTicketVoByPage(
  body: API.TicketQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTicketVO>("/api/ticket/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/ticket/update */
export async function updateTicket(
  body: API.TicketUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/ticket/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
