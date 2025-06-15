import request from "../utils/request";

export async function addAttractionsType(
  body: API.AttractionsTypeAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/attractions/type/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteAttractionsType(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/type/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function getAllTypes(options?: { [key: string]: any }) {
  return request<API.BaseResponseListAttractionsTypeVO>(
    "/api/attractions/type/list",
    {
      method: "GET",
      ...(options || {}),
    }
  );
}

export async function listAttractionsTypeByPage(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listAttractionsTypeByPageParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAttractionsTypeVO>(
    "/api/attractions/type/list/page",
    {
      method: "GET",
      params: {
        // current has a default value: 1
        current: "1",
        // size has a default value: 10
        size: "10",
        ...params,
      },
      ...(options || {}),
    }
  );
}


export async function updateAttractionsType(
  body: API.AttractionsTypeUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/attractions/type/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
