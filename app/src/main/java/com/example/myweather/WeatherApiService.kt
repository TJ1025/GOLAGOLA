package com.example.myweather // 본인의 패키지 이름

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Call
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

interface WeatherApiService {

    // GET 요청 정의: 현재 날씨 정보를 가져옴
    @GET("data/2.5/weather")
    fun getCurrentWeather(
        @Query("q") cityName: String,          // 쿼리 파라미터: 도시 이름
        @Query("appid") apiKey: String,        // 쿼리 파라미터: API 키
        @Query("units") units: String = "metric", // 쿼리 파라미터: 단위 (metric=섭씨)
        @Query("lang") lang: String = "kr"       // 쿼리 파라미터: 언어 (kr=한국어)
    ): Call<WeatherResponse> // 반환 타입: WeatherResponse 객체를 담은 Call 객체

    // Retrofit 인스턴스를 생성하는 companion object
    companion object {
        private const val BASE_URL = "https://api.openweathermap.org/"

        fun create(): WeatherApiService {
            // 네트워크 요청/응답을 로깅하기 위한 인터셉터
            val loggingInterceptor = HttpLoggingInterceptor().apply {
                // 로그 레벨 설정 (BODY: 요청/응답의 모든 내용을 보여줌)
                level = HttpLoggingInterceptor.Level.BODY
            }

            // OkHttpClient에 로깅 인터셉터 추가
            val client = OkHttpClient.Builder()
                .addInterceptor(loggingInterceptor)
                .build()

            // Retrofit 인스턴스 생성
            val retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL) // API 기본 URL
                .client(client)    // 위에서 만든 OkHttpClient 사용
                .addConverterFactory(GsonConverterFactory.create()) // JSON <-> 객체 변환기 (Gson)
                .build()

            // WeatherApiService 인터페이스의 구현체 반환
            return retrofit.create(WeatherApiService::class.java)
        }
    }
}