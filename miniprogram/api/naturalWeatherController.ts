// @ts-ignore
/* eslint-disable */
import { request } from "../utils/request";

/** 此处后端没有提供注释 POST /api/natural/weather/add */
export async function addWeather(
  body: API.NaturalWeatherAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>("/api/natural/weather/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/natural/weather/delete */
export async function deleteWeather(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/natural/weather/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /api/natural/weather/get/vo */
export async function getWeatherVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getWeatherVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseNaturalWeatherVO>(
    "/api/natural/weather/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** 此处后端没有提供注释 POST /api/natural/weather/list/page/vo */
export async function listWeatherVoByPage(
  body: API.NaturalWeatherQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageNaturalWeatherVO>(
    "/api/natural/weather/list/page/vo",
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

/** 此处后端没有提供注释 GET /api/natural/weather/now */
export async function getCurrentWeather(options?: { [key: string]: any }) {
  return request<API.BaseResponseNaturalWeatherVO>("/api/natural/weather/now", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /api/natural/weather/update */
export async function updateWeather(
  body: API.NaturalWeatherUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>("/api/natural/weather/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
