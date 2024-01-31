// When the document is ready, execute the following code
$(document).ready(function () {
    // API key for OpenWeatherMap
    const apiKey = 'd8e7e5ce82a97e212e43f46da05ae432';

    // Function to get weather data using OpenWeatherMap API
    function getWeather(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

        $.ajax({
            url: apiUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                // Check if the data is valid
                if (data && data.name) {
                    // Display weather data
                    displayWeather(data, city);
                    // Add to history only if data is valid
                    addToHistory(city);
                } else {
                    // Log an error if data is not valid
                    console.error('Invalid weather data received:', data);
                    showFeedback('Invalid weather data. Please try again.');
                }
            },
            error: function (error) {
                // Log an error if there's an issue fetching weather data
                console.error('Error fetching weather data:', error);
                showFeedback('Error fetching weather data. Please try again later.');
            }
        });
    }

    // Function to display current weather
    function displayWeather(data, city) {
        // Clear existing content
        $('#today').empty();

        // Extract relevant data from the API response
        const cityName = data.name;
        const date = getTheCurrentDate();
        const weatherIcon = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/w/${weatherIcon}.png`;
        const temperature = data.main.temp;
        const temperatureCelsius = (temperature - 273.15).toFixed(2);
        const windSpeed = data.wind.speed.toFixed(2);
        const humidity = data.main.humidity;

        // Create HTML content for current weather
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

        // Fetch 5-day forecast using city name
        getForecast(city);
    }

    // Function to get 5-day forecast using city name
    function getForecast(city) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

        $.ajax({
            url: forecastUrl,
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                // Display 5-day forecast
                displayForecast(data);
            },
            error: function (error) {
                // Log an error if there's an issue fetching forecast data
                console.error('Error fetching forecast data:', error);
                showFeedback('Error fetching forecast data. Please try again later.');
            }
        });
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
        // Update HTML with 5-day forecast data (next 5 days)
        const forecastData = [];
        for (let i = 8; i < data.list.length; i += 7) {
            forecastData.push(data.list[i]);
        }

        $('.forecast-list').empty();

        // Loop through forecast data and create HTML for each day
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

    function getTheCurrentDate() {
        // Get the current date
        var currentDate = new Date();

        // Extract day, month, and year components
        var day = currentDate.getDate();
        var month = currentDate.getMonth() + 1; // Adding 1 because months are zero-based
        var year = currentDate.getFullYear();

        // Format the date as dd/mm/yyyy
        return (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + year;
    }

    // Function to format date string
    function formatDateString(dateString) {
        const [year, month, day] = dateString.split(' ')[0].split('-');
        return `${day}/${month}/${year}`;
    }

    // Event handler for the search form submission
    $('#searchForm').submit(function (event) {
        event.preventDefault();
        const city = $('#searchInput').val().trim();

        // If the input is not empty, get weather
        if (city !== '') {
            getWeather(city);
        }
    });

    // Function to add searched city to history
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

    // Event handler for clicking on a city in the search history
    $('#history').on('click', 'button', function () {
        const city = $(this).text();
        $('#searchInput').val(city);
        getWeather(city);
    });

    // Load search history from localStorage on page load
    const storedHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    storedHistory.forEach(city => addToHistory(city));

    // Function to show feedback message
    function showFeedback(message) {
        // Display the feedback message
        $('#feedback').text(message).show();

        // Hide the message after a few seconds (optional)
        setTimeout(function () {
            $('#feedback').hide();
        }, 3000); // Adjust the timeout as needed
    }
});