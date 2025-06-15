// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/task/disposal/add */
export async function addTaskDisposal(
  body: API.TaskDisposalAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/task/disposal/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/task/disposal/delete */
export async function deleteTaskDisposal(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/disposal/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/task/disposal/get */
export async function getTaskDisposalById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskDisposalByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskDisposal>("/api/task/disposal/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/task/disposal/get/vo */
export async function getTaskDisposalVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskDisposalVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskDisposalVO>("/api/task/disposal/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/task/disposal/list/my/page/vo */
export async function listMyTaskDisposalVoByPage(
  body: API.TaskDisposalQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskDisposalVO>(
    "/api/task/disposal/list/my/page/vo",
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

/** 此处后端没有提供注释 POST /api/task/disposal/list/page/vo */
export async function listTaskDisposalVoByPage(
  body: API.TaskDisposalQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskDisposalVO>(
    "/api/task/disposal/list/page/vo",
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

/** 此处后端没有提供注释 POST /api/task/disposal/update */
export async function updateTaskDisposal(
  body: API.TaskDisposalUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/disposal/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
