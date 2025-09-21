// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/order/create */
export async function createOrder(
  body: API.OrderCreateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/order/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/order/delete */
export async function deleteOrder(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/order/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/order/get */
export async function getOrderById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseOrder>("/api/order/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/order/get/vo */
export async function getOrderVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getOrderVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseOrderVO>("/api/order/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/order/list/my/page/vo */
export async function listMyOrderVoByPage(
  body: API.OrderQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageOrderVO>("/api/order/list/my/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/order/list/page */
export async function listOrderByPage(
  body: API.OrderQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageOrder>("/api/order/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/order/list/page/vo */
export async function listOrderVoByPage(
  body: API.OrderQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageOrderVO>("/api/order/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/order/update/status */
export async function updateOrderStatus(
  body: API.OrderUpdateStatusRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/order/update/status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
