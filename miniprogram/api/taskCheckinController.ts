// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/task/checkin/add */
export async function addTaskCheckin(
  body: API.TaskCheckinAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/task/checkin/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/task/checkin/delete */
export async function deleteTaskCheckin(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/checkin/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/task/checkin/get */
export async function getTaskCheckinById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskCheckinByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskCheckin>("/api/task/checkin/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/task/checkin/get/vo */
export async function getTaskCheckinVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskCheckinVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskCheckinVO>("/api/task/checkin/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/task/checkin/list/my/page/vo */
export async function listMyTaskCheckinVoByPage(
  body: API.TaskCheckinQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskCheckinVO>(
    "/api/task/checkin/list/my/page/vo",
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

/** 此处后端没有提供注释 POST /api/task/checkin/list/page/vo */
export async function listTaskCheckinVoByPage(
  body: API.TaskCheckinQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskCheckinVO>(
    "/api/task/checkin/list/page/vo",
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

/** 此处后端没有提供注释 POST /api/task/checkin/update */
export async function updateTaskCheckin(
  body: API.TaskCheckinUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/checkin/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
