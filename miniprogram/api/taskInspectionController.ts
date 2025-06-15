import request from "../utils/request";


export async function addTaskInspection(
  body: API.TaskInspectionAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/task/inspection/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function deleteTaskInspection(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/inspection/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function getTaskInspectionById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskInspectionByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskInspection>("/api/task/inspection/get", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}


export async function getTaskInspectionVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskInspectionVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseTaskInspectionVO>(
    "/api/task/inspection/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}


export async function listMyTaskInspectionVoByPage(
  body: API.TaskInspectionQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskInspectionVO>(
    "/api/task/inspection/list/my/page/vo",
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


export async function listTaskInspectionVoByPage(
  body: API.TaskInspectionQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskInspectionVO>(
    "/api/task/inspection/list/page/vo",
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


export async function updateTaskInspection(
  body: API.TaskInspectionUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/inspection/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
