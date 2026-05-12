const raceNameElement = document.querySelector("#raceName");
const raceDateElement = document.querySelector("#raceDate");
const raceCountdownElement = document.querySelector("#raceCountdown");
const raceWeatherElement = document.querySelector("#raceWeather");

const nextRace = {
    name: "Canadian Grand Prix",
    date: "2026-05-24T22:00:00",
    location: "Montreal",
    lat: 45.5088,
    long: -73.5878
}

raceNameElement.textContent = nextRace.name;
raceDateElement.textContent = "24th of May 2026";

function updateCountdown(){
    const raceDate = new Date(nextRace.date);
    const now = new Date();

    const diff = raceDate - now;

    if(diff <= 0){
        raceCountdownElement.textContent = "Race day is here!"
        return;
    }

    //Diff is given in milliseconds, therefore here we are changing them to days, hours and minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math. floor ((diff / (1000 * 60)) % 60);

    raceCountdownElement.textContent =
        `${days} days, ${hours} hours, ${minutes} minutes to go`;
}

updateCountdown();
setInterval(updateCountdown, 60000);

async function loadRaceWeather() {
    raceWeatherElement.textContent = "Loading race weather...";

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${nextRace.lat}&longitude=${nextRace.long}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather request failed");
        }

        const data = await response.json();

        const current = data.current;

        raceWeatherElement.innerHTML = `
            <h4>Weather in ${nextRace.location}</h4>
            <p><strong>Temperature:</strong> ${current.temperature_2m}°C</p>
            <p><strong>Precipitation:</strong> ${current.precipitation} mm</p>
            <p><strong>Wind speed:</strong> ${current.wind_speed_10m} km/h</p>
        `;
    } catch (error) {
        raceWeatherElement.textContent = "Could not load race weather.";
    }
}

loadRaceWeather();