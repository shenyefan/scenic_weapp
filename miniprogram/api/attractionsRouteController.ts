import request from "../utils/request";


export async function addAttractionsRoute(
  body: API.AttractionsRouteAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/attractions/route/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function deleteAttractionsRoute(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/route/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function getAttractionsRouteVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getAttractionsRouteVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAttractionsRouteVO>(
    "/api/attractions/route/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}


export async function listAttractionsRouteByPage(
  body: API.AttractionsRouteQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAttractionsRoute>(
    "/api/attractions/route/list/page",
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


export async function listAttractionsRouteVoByPage(
  body: API.AttractionsRouteQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAttractionsRouteVO>(
    "/api/attractions/route/list/page/vo",
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


export async function updateAttractionsRoute(
  body: API.AttractionsRouteUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/route/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
