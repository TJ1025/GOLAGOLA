package com.example.myweather // 본인의 패키지 이름으로 되어 있는지 확인

import com.google.gson.annotations.SerializedName

// API 전체 응답 구조
data class WeatherResponse(
    @SerializedName("weather") val weather: List<WeatherDescription>, // 날씨 정보 리스트 (보통 하나만 옴)
    @SerializedName("main") val main: MainDetails,                   // 주요 날씨 정보 (온도, 습도 등)
    @SerializedName("wind") val wind: WindDetails,                   // 바람 정보
    @SerializedName("sys") val sys: SysDetails,                     // 시스템 정보 (일출/일몰 등)
    @SerializedName("name") val cityName: String,                    // 도시 이름
    @SerializedName("cod") val cod: Int                             // API 응답 코드 (200이면 성공)
)

// 날씨 상세 설명 ("weather" 배열의 요소)
data class WeatherDescription(
    @SerializedName("id") val id: Int,                               // 날씨 상태 ID
    @SerializedName("main") val mainCondition: String,               // 주된 날씨 상태 (예: "Clouds", "Clear")
    @SerializedName("description") val description: String,           // 날씨 설명 (예: "흐림", "맑음")
    @SerializedName("icon") val icon: String                         // 날씨 아이콘 ID
)

// 주요 날씨 정보 ("main" 객체)
data class MainDetails(
    @SerializedName("temp") val temperature: Float,                  // 현재 온도
    @SerializedName("feels_like") val feelsLike: Float,              // 체감 온도
    @SerializedName("temp_min") val tempMin: Float,                  // 최저 온도
    @SerializedName("temp_max") val tempMax: Float,                  // 최고 온도
    @SerializedName("pressure") val pressure: Int,                   // 기압
    @SerializedName("humidity") val humidity: Int                    // 습도
)

// 바람 정보 ("wind" 객체)
data class WindDetails(
    @SerializedName("speed") val speed: Float,                      // 풍속
    @SerializedName("deg") val deg: Int                            // 풍향 (도)
)

// 시스템 정보 ("sys" 객체)
data class SysDetails(
    @SerializedName("country") val country: String,                   // 국가 코드 (예: "KR")
    @SerializedName("sunrise") val sunrise: Long,                   // 일출 시간 (Unix timestamp)
    @SerializedName("sunset") val sunset: Long                     // 일몰 시간 (Unix timestamp)
)
