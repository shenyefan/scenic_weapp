/**
 * 天气相关工具函数
 */

// 天气数据接口
export interface WeatherData {
  temperature: string
  text: string
}

// 和风天气API响应接口
interface QWeatherResponse {
  code: string
  now: {
    temp: string
    text: string
    [key: string]: any
  }
  [key: string]: any
}

/**
 * 获取天气信息
 * @param location 位置编码，默认为古塔区
 * @param key API密钥
 * @returns Promise<WeatherData | null>
 */
export async function getWeatherInfo(
  location: string = '101070703',
  key: string = '81ddeaa364094648a235113f2599279e'
): Promise<WeatherData | null> {
  try {
    // 使用 Promise 包装 wx.request
    const res = await new Promise<any>((resolve, reject) => {
      wx.request({
        url: 'https://my4wck8gfh.re.qweatherapi.com/v7/weather/now',
        data: {
          location,
          key
        },
        method: 'GET',
        success: (result) => {
          resolve(result)
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
    
    console.log('天气API响应:', res)
    
    if (res.statusCode === 200 && res.data.code === '200') {
      const weatherData = res.data.now
      console.log('天气数据:', weatherData)
      
      return {
        temperature: weatherData.temp,
        text: weatherData.text
      }
    } else {
      console.error('获取天气信息失败:', res.data)
      return null
    }
  } catch (error) {
    console.error('天气API请求失败:', error)
    return null
  }
}