$(document).ready(function () {
    const apiKey = 'd8e7e5ce82a97e212e43f46da05ae432';

    function getCoordinates(city) {
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;

        $.ajax({
            url: geoUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data && data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    getWeather(city, lat, lon);
                    addToHistory(city);
                } else {
                    console.error('No coordinates found for the city:', city);
                    showFeedback('No coordinates found for the city.');
                }
            },
            error: function (error) {
                console.error('Error fetching coordinates:', error);
                showFeedback('Error fetching coordinates. Please try again later.');
            }
        });
    }

    function getWeather(city, lat, lon) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                displayWeather(data);
            },
            error: function (error) {
                console.error('Error fetching weather data:', error);
                showFeedback('Error fetching weather data. Please try again later.');
            }
        });
    }

    function displayWeather(data) {
        // Clear existing content
        $('#today').empty();

        // Getting data
        const cityName = data.city.name;
        const date = formatDateString(data.list[0].dt_txt);
        const weatherIcon = data.list[0].weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;
        const temperature = data.list[0].main.temp;
        const temperatureCelsius = (temperature - 273.15).toFixed(2);
        const windSpeed = data.list[0].wind.speed.toFixed(2);
        const humidity = data.list[0].main.humidity;

        const todayContent = `
            <h2>${cityName}
                <small>
                    <span>(${date})</span>
                    <img src="${iconUrl}" alt="Weather Icon">
                </small>
            </h2>
            <p>Temp: ${temperatureCelsius} °C</p>
            <p>Wind: ${windSpeed} KPH</p>
            <p>Humidity: ${humidity}%</p>
        `;

        // Append the dynamically created HTML to the "today" section
        $('#today').append(todayContent);

        // Fetch 5-day forecast using coordinates from the current weather data
        const lat = data.city.coord.lat;
        const lon = data.city.coord.lon;
        getForecast(lat, lon);
    }

    function getForecast(lat, lon) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

        $.ajax({
            url: forecastUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                displayForecast(data);
            },
            error: function (error) {
                console.error('Error fetching forecast data:', error);
                showFeedback('Error fetching forecast data. Please try again later.');
            }
        });
    }

    function displayForecast(data) {
        // Update HTML with 5-day forecast data (next 5 days)
        const forecastData = [];
        for (let i = 1; i < data.list.length; i += 8) {
            forecastData.push(data.list[i]);
        }

        $('.forecast-list').empty();

        forecastData.forEach(day => {
            const forecastDate = formatDateString(day.dt_txt);
            const weatherIcon = day.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;
            const temperature = day.main.temp;
            const temperatureCelsius = (temperature - 273.15).toFixed(2);
            const windSpeed = day.wind.speed.toFixed(2);
            const humidity = day.main.humidity;

            const forecastContent = `
                <div class="forecast-item col-sm">
                    <p>${forecastDate}</p>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>Temp: ${temperatureCelsius} °C</p>
                    <p>Wind: ${windSpeed} KPH</p>
                    <p>Humidity: ${humidity}%</p>
                </div>
            `;

            // Append the dynamically created HTML to the "forecast" section
            $('.forecast-list').append(forecastContent);
        });
    }

    function formatDateString(dateString) {
        const [year, month, day] = dateString.split(' ')[0].split('-');
        return `${day}/${month}/${year}`;
    }

    $('#searchForm').submit(function (event) {
        event.preventDefault();
        const city = $('#searchInput').val().trim();

        if (city !== '') {
            getCoordinates(city);
        }
    });

    function addToHistory(city) {
        // Check if the city is already in the history
        if ($('#history button:contains("' + city + '")').length === 0) {
            // Update search history HTML
            $('#history').append(`<button class="btn btn-secondary mb-3">${city}</button>`);

            // Store search history in localStorage
            const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
            history.push(city);
            localStorage.setItem('weatherHistory', JSON.stringify(history));
        }
    }

    $('#history').on('click', 'button', function () {
        const city = $(this).text();
        $('#searchInput').val(city);
        getCoordinates(city);
    });

    // Load search history from localStorage on page load
    const storedHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    storedHistory.forEach(city => addToHistory(city));

    function showFeedback(message) {
        // Display the feedback message
        $('#feedback').text(message).show();

        // Hide the message after a few seconds (optional)
        setTimeout(function () {
            $('#feedback').hide();
        }, 3000); // Adjust the timeout as needed
    }
});