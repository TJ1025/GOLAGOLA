package com.example.myweather // 본인의 패키지 이름

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.ImageView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.myweather.databinding.ActivityMainBinding // 생성된 ViewBinding 클래스 임포트
// import com.bumptech.glide.Glide // Glide 라이브러리를 사용할 경우 import (나중에 아이콘 로드 시 필요)
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private val weatherApiService = WeatherApiService.create()

    // !!! ★★★ 중요 ★★★ !!!
    // 여기에 OpenWeatherMap에서 발급받은 본인의 API 키를 입력하세요.
    private val apiKey = "36d6b6a75df90bad9d15bacc85422f2b" // <--- ★ 이 부분을 실제 API 키로 꼭! 바꿔주세요! ★

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // API 키 유효성 검사
        if (apiKey == "YOUR_API_KEY_HERE" || apiKey.isBlank()) {
            Toast.makeText(this, "MainActivity.kt 파일에 OpenWeatherMap API 키를 입력해주세요!", Toast.LENGTH_LONG).show()
            binding.buttonGetWeather.isEnabled = false
        }

        // "날씨 확인하기" 버튼 클릭 리스너
        binding.buttonGetWeather.setOnClickListener {
            handleWeatherSearch()
        }

        // EditText에서 키보드의 검색(완료) 버튼 클릭 리스너
        binding.editTextCityName.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH || actionId == EditorInfo.IME_ACTION_DONE) {
                handleWeatherSearch()
                return@setOnEditorActionListener true
            }
            return@setOnEditorActionListener false
        }

        // 초기에는 날씨 정보 카드 숨기기 (XML에서도 gone으로 설정했지만, 코드로도 명시)
        binding.cardWeatherInfo.visibility = View.GONE
    }

    // 날씨 검색 로직을 처리하는 함수
    private fun handleWeatherSearch() {
        val cityName = binding.editTextCityName.text.toString().trim()
        if (cityName.isNotEmpty()) {
            hideKeyboard()
            fetchWeatherData(cityName)
        } else {
            Toast.makeText(this, "도시 이름을 입력해주세요.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun fetchWeatherData(cityName: String) {
        binding.progressBar.visibility = View.VISIBLE
        binding.cardWeatherInfo.visibility = View.GONE // 새 검색 시 날씨 정보 카드 숨기기
        clearWeatherDataOnUI()

        Log.d("WeatherApp", "Fetching weather for city: $cityName")

        weatherApiService.getCurrentWeather(cityName = cityName, apiKey = apiKey)
            .enqueue(object : Callback<WeatherResponse> {
                override fun onResponse(call: Call<WeatherResponse>, response: Response<WeatherResponse>) {
                    binding.progressBar.visibility = View.GONE

                    if (response.isSuccessful) {
                        val weatherData = response.body()
                        if (weatherData != null && weatherData.cod == 200) {
                            Log.i("WeatherApp", "API Response Success: $weatherData")
                            updateUI(weatherData)
                        } else {
                            val errorMessage = when (weatherData?.cod) {
                                401 -> "API 키가 유효하지 않습니다. MainActivity.kt 파일을 확인해주세요."
                                404 -> "'${cityName}' 도시를 찾을 수 없습니다. 도시 이름을 확인해주세요."
                                429 -> "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
                                else -> "날씨 정보를 가져오는데 실패했습니다. (서버 응답 코드: ${weatherData?.cod ?: response.code()})"
                            }
                            Log.e("WeatherApp", "API Logic Error: Code ${weatherData?.cod}, Message: ${response.message()}, Server Message: ${weatherData}")
                            Toast.makeText(this@MainActivity, errorMessage, Toast.LENGTH_LONG).show()
                            binding.cardWeatherInfo.visibility = View.GONE // 오류 시 카드 숨김 유지
                        }
                    } else {
                        val errorBody = try { response.errorBody()?.string() } catch (e: IOException) { "응답 본문 읽기 실패" }
                        Log.e("WeatherApp", "API HTTP Error: Code ${response.code()}, Message: ${response.message()}, ErrorBody: $errorBody")
                        Toast.makeText(this@MainActivity, "날씨 정보 서버(${response.code()})로부터 응답을 받지 못했습니다.", Toast.LENGTH_LONG).show()
                        binding.cardWeatherInfo.visibility = View.GONE // 오류 시 카드 숨김 유지
                    }
                }

                override fun onFailure(call: Call<WeatherResponse>, t: Throwable) {
                    binding.progressBar.visibility = View.GONE
                    Log.e("WeatherApp", "API Network Failure: ${t.message}", t)
                    Toast.makeText(this@MainActivity, "네트워크 오류가 발생했습니다: ${t.message}", Toast.LENGTH_LONG).show()
                    binding.cardWeatherInfo.visibility = View.GONE // 오류 시 카드 숨김 유지
                }
            })
    }

    private fun updateUI(data: WeatherResponse) {
        binding.textViewCity.text = "${data.cityName}, ${data.sys.country}"
        binding.textViewTemperature.text = "${data.main.temperature}°C"
        binding.textViewWeatherDescription.text = data.weather.firstOrNull()?.description ?: "정보 없음"
        binding.textViewHumidity.text = "${data.main.humidity}%"

        // 날씨 아이콘 로드 (예시: Glide 사용) - Glide 라이브러리 추가 필요
        // data.weather.firstOrNull()?.icon?.let { iconCode ->
        //     val iconUrl = "https://openweathermap.org/img/wn/${iconCode}@2x.png"
        //     Glide.with(this@MainActivity)
        //         .load(iconUrl)
        //         .into(binding.imageViewWeatherIcon)
        // }

        // 풍속 정보 표시 (데이터 모델에 wind.speed가 있다면)
        // binding.textViewWindSpeed.text = "${data.wind.speed} m/s"
        // binding.layoutWindSpeed.visibility = View.VISIBLE


        binding.cardWeatherInfo.visibility = View.VISIBLE // 모든 정보 업데이트 후 날씨 카드 보이기
    }

    private fun clearWeatherDataOnUI() {
        // UI 초기화 시 날씨 정보 카드 내의 텍스트를 비우거나 기본값으로 설정
        binding.textViewCity.text = "도시: "
        binding.textViewTemperature.text = "온도: "
        binding.textViewWeatherDescription.text = "날씨: "
        binding.textViewHumidity.text = "습도: "
        // binding.imageViewWeatherIcon.setImageResource(0) // 아이콘도 초기화
        // binding.textViewWindSpeed.text = "풍속: "
        // binding.layoutWindSpeed.visibility = View.GONE
    }

    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        val view = currentFocus ?: View(this) // 현재 포커스된 뷰가 없으면 임시 뷰 생성
        imm.hideSoftInputFromWindow(view.windowToken, 0)
    }
}