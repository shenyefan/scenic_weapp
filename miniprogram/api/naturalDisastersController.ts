import request from "../utils/request";


export async function addDisasters(
  body: API.NaturalDisastersAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/natural/disasters/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteDisasters(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/natural/disasters/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}


export async function getDisastersVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getDisastersVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseNaturalDisastersVO>(
    "/api/natural/disasters/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}


export async function listDisastersVoByPage(
  body: API.NaturalDisastersQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageNaturalDisastersVO>(
    "/api/natural/disasters/list/page/vo",
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


export async function updateDisasters(
  body: API.NaturalDisastersUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/natural/disasters/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
