// Global Variables
let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    apiKey = '575e0de342b75bb66517f97bfc998773'; 

// DOM Elements for Updating Weather Information
let currentWeatherCard = document.querySelector('.weather-left .card');
let fiveDaysForecastCard = document.querySelector('.day-forecast');
let aqiCard = document.querySelectorAll('.highlights .card')[0]; 
let sunriseCard = document.querySelectorAll('.highlights .card')[1];
let humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibilityVal'),
    windSpeedVal = document.getElementById('windSpeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    hourlyForecastCard = document.querySelector('.hourly-forecast');

// AQI List for Displaying Air Quality Levels
let aqiList = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];

// Function to Fetch and Display Weather Details
function getWeatherDetails(name, lat, lon, country, state) {
    // API URLs
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
        AIR_POLLUTION_API_URL = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    // Arrays for Days and Months Names
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Fetch Air Quality Index
    fetch(AIR_POLLUTION_API_URL)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            let { co, no, no2, o3, so2, pm2_5, pm10, nh3 } = data.list[0].components;
            let aqiIndex = data.list[0].main.aqi;
            // Update AQI Card with Fetched Data
            aqiCard.innerHTML = `
                <div class="card-head">
                    <p>Air Quality Index</p>
                    <p class="air-index aqi-${aqiIndex}">${aqiList[aqiIndex - 1]}</p>
                </div>
                <div class="air-indices">
                    <i class="fa-regular fa-wind fa-3x"></i>
                    <div class="item"><p>PM2.5</p><h2>${pm2_5}</h2></div>
                    <div class="item"><p>PM10</p><h2>${pm10}</h2></div>
                    <div class="item"><p>SO2</p><h2>${so2}</h2></div>
                    <div class="item"><p>CO</p><h2>${co}</h2></div>
                    <div class="item"><p>NO</p><h2>${no}</h2></div>
                    <div class="item"><p>NO2</p><h2>${no2}</h2></div>
                    <div class="item"><p>NH3</p><h2>${nh3}</h2></div>
                    <div class="item"><p>O3</p><h2>${o3}</h2></div>
                </div>
            `;
        })
        .catch(error => {
            console.error('Error fetching Air Quality Index:', error);
            alert('Failed to fetch Air Quality Index');
        });

    // Fetch Current Weather Data
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            let date = new Date();
            let { temp, humidity, pressure, feels_like } = data.main;
            let { speed } = data.wind;
            let { description, icon } = data.weather[0];
            let { sunrise, sunset } = data.sys;
            let { timezone, visibility } = data;
            
            // Convert temperature from Kelvin to Celsius
            let tempCelsius = (temp - 273.15).toFixed(2);
            let feelsCelsius = (feels_like - 273.15).toFixed(2);

            // Format sunrise and sunset times
            let SRiseTime = moment.utc(sunrise, 'X').add(timezone, 'seconds').format('hh:mm A');
            let SSetTime = moment.utc(sunset, 'X').add(timezone, 'seconds').format('hh:mm A');

            // Update Current Weather Card
            currentWeatherCard.innerHTML = `
                <div class="current-weather">
                    <div class="details">
                        <p>Now</p>
                        <h2>${tempCelsius}&deg;C</h2>
                        <p>${description}</p>
                    </div>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Weather Icon">
                    </div>
                </div>
                <hr>
                <div class="card-footer">
                    <p><i class="fa-light fa-calendar"></i> ${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                    <p><i class="fa-light fa-location-dot"></i> ${name}, ${country}</p>
                </div>`;

            // Update Sunrise and Sunset Card
            sunriseCard.innerHTML = `
                <div class="card-head">
                    <p>Sunrise & Sunset</p>
                </div>
                <div class="sunrise-sunset">
                    <div class="item">
                        <div class="icon">
                            <i class="fa-light fa-sunrise fa-4x"></i>
                        </div>
                        <div>
                            <p>Sunrise</p>
                            <h2>${SRiseTime}</h2>
                        </div>
                    </div>
                    <div class="item">
                        <div class="icon">
                            <i class="fa-light fa-sunset fa-4x"></i>
                        </div>
                        <div>
                            <p>Sunset</p>
                            <h2>${SSetTime}</h2>
                        </div>
                    </div>
                </div>`;

            // Update Other Weather Metrics
            humidityVal.innerHTML = `${humidity}%`;
            pressureVal.innerHTML = `${pressure} hPa`;
            visibilityVal.innerHTML = `${(visibility / 1000).toFixed(2)} km`;
            windSpeedVal.innerHTML = `${speed} m/s`;
            feelsVal.innerHTML = `${feelsCelsius}&deg;C`;
        })
        .catch(() => {
            alert('Failed to fetch current weather');
        });

    // Fetch 5-Day Weather Forecast Data
    fetch(FORECAST_API_URL)
        .then(res => res.json())
        .then(data => {
            let hourlyForecast = data.list;
            hourlyForecastCard.innerHTML = ''; // Clear previous content

            // Update Hourly Forecast for the next 8 hours
            for (let i = 0; i <= 7; i++) {
                let hrForecastDate = new Date(hourlyForecast[i].dt_txt);
                let hr = hrForecastDate.getHours();
                let period = hr >= 12 ? 'PM' : 'AM';

                if (hr == 0) hr = 12;
                if (hr > 12) hr -= 12;

                hourlyForecastCard.innerHTML += `
                    <div class="card">
                        <p>${hr} ${period}</p>
                        <img src="https://openweathermap.org/img/wn/${hourlyForecast[i].weather[0].icon}.png" alt="Weather Icon">
                        <p>${(hourlyForecast[i].main.temp - 273.15).toFixed(2)}&deg;C</p>
                    </div>
                `;
            }

            // Filter for unique forecast days
            let uniqueForecastDays = [];
            let fiveDaysForecast = hourlyForecast.filter(forecast => {
                let forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });

            // Update 5-Day Forecast
            fiveDaysForecastCard.innerHTML = '';  // Clear previous content

            fiveDaysForecast.forEach((forecast, i) => {
                let date = new Date(forecast.dt_txt);
                fiveDaysForecastCard.innerHTML += `
                    <div class="forecast-item">
                        <div class="icon-wrapper">
                            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather Icon">
                            <span>${(forecast.main.temp - 273.15).toFixed(2)}&deg;C</span>
                        </div>
                        <p>${date.getDate()} ${months[date.getMonth()]}</p>
                        <p>${days[date.getDay()]}</p>
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching forecast data:', error);
            alert('Failed to fetch weather forecast');
        });
}

// Function to Get City Coordinates
function getCityCoordinates() {
    let cityName = cityInput.value.trim();

    if (!cityName) return; // If input is empty, exit function

    let GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}`;

    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) {
                let { name, lat, lon, country, state } = data[0];
                getWeatherDetails(name, lat, lon, country, state);
            } else {
                alert(`No coordinates found for ${cityName}`);
            }
        })
        .catch(error => {
            console.error('Failed to fetch coordinates:', error);
            alert(`Failed to fetch coordinates for ${cityName}`);
        });
}

// Function to Get User's Geolocation Coordinates
function getUserCoordinates() {
    navigator.geolocation.getCurrentPosition(position => {
        let { latitude, longitude } = position.coords;
        let REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

        fetch(REVERSE_GEOCODING_URL)
            .then(res => res.json())
            .then(data => {
                if (data.length > 0) {
                    let { name, country, state } = data[0];
                    getWeatherDetails(name, latitude, longitude, country, state);
                } else {
                    alert('No location data found.');
                }
            })
            .catch(() => {
                alert('Failed to fetch user coordinates.');
            });
    }, error => {
        if (error.code === error.PERMISSION_DENIED) {
            alert('Geolocation permission denied. Please reset location permission to grant access again.');
        } else {
            alert('Failed to retrieve location.');
        }
    });
}

// Event Listeners
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserCoordinates);
cityInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        getCityCoordinates();
    }
});
window.addEventListener('load', getUserCoordinates); // Get user location on page load
