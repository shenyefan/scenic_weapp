import request from "../utils/request";


export async function getTaskTrackDetail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getTaskTrackDetailParams,
  options?: { [key: string]: any }
) {
  const { trackId: param0, ...queryParams } = params;
  return request<API.BaseResponseTaskTrackVO>(
    `/api/task/track/detail/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}


export async function endTrack(
  body: API.TaskTrackEndRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/track/end", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function listTaskTrackVoByPage(
  body: API.TaskTrackQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageTaskTrackVO>(
    "/api/task/track/list/page/vo",
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


export async function addTrackPoint(
  body: API.TaskTrackPointAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/task/track/point", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function startTrack(
  body: API.TaskTrackStartRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/task/track/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
