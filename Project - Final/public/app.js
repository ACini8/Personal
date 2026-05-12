// Runs when the page has finished loading.
document.addEventListener('DOMContentLoaded', function () {
    setupMobileNavigation();
    setupHomePage();
    setupCommunityTeamsPage();
    setupTeamFormPage();
});

function setupMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });
}

//Line 20-61: Race Countdown and Race Details
function setupHomePage() {
    const raceNameElement = document.querySelector('#raceName');
    const raceDateElement = document.querySelector('#raceDate');
    const raceCountdownElement = document.querySelector('#raceCountdown');
    const raceWeatherElement = document.querySelector('#raceWeather');

    if (!raceNameElement || !raceDateElement || !raceCountdownElement || !raceWeatherElement) return;

    const nextRace = {
        name: 'Canadian Grand Prix',
        date: '2026-05-24T22:00:00',
        location: 'Montreal',
        lat: 45.5088,
        long: -73.5878
    };

    raceNameElement.textContent = nextRace.name;
    raceDateElement.textContent = 'Date: 24th of May 2026';

    function updateCountdown() {
        const raceDate = new Date(nextRace.date);
        const now = new Date();
        const diff = raceDate - now;

        if (diff <= 0) {
            raceCountdownElement.textContent = 'Race day is here!';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);

        raceCountdownElement.textContent = `${days} days, ${hours} hours, ${minutes} minutes to go`;
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);

    loadRaceWeather(nextRace, raceWeatherElement);
}

//Line 64-87: Open-Meteo API Weather at Race
async function loadRaceWeather(nextRace, raceWeatherElement) {
    raceWeatherElement.textContent = 'Loading race weather...';

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${nextRace.lat}&longitude=${nextRace.long}&current=temperature_2m,precipitation,wind_speed_10m&timezone=auto`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Weather request failed');
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
        raceWeatherElement.textContent = 'Could not load race weather.';
    }
}

function setupCommunityTeamsPage() {
    const teamsGrid = document.querySelector('#teamsGrid');
    const loadingState = document.querySelector('#loadingState');
    const errorState = document.querySelector('#errorState');

    if (!teamsGrid || !loadingState || !errorState) return;

    loadTeams();
}

async function loadTeams() {
    const teamsGrid = document.querySelector('#teamsGrid');
    const loadingState = document.querySelector('#loadingState');
    const errorState = document.querySelector('#errorState');

    if (!teamsGrid || !loadingState || !errorState) return;

    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    teamsGrid.classList.add('hidden');
    teamsGrid.innerHTML = '';

    try {
        const response = await fetch('/api/community-teams');

        if (!response.ok) {
            throw new Error('Could not load teams');
        }

        const teams = await response.json();

        loadingState.classList.add('hidden');
        errorState.classList.add('hidden');
        teamsGrid.classList.remove('hidden');

        if (teams.length === 0) {
            teamsGrid.textContent = 'No fantasy teams have been submitted yet.';
            return;
        }

        teams.forEach(function (team) {
            teamsGrid.appendChild(createTeamCard(team));
        });

    } catch (error) {
        console.error(error);

        loadingState.classList.add('hidden');
        teamsGrid.classList.add('hidden');
        teamsGrid.innerHTML = '';
        errorState.classList.remove('hidden');
    }
}

function createTeamCard(team) {
    const article = document.createElement('article');
    article.classList.add('team-card');

    const drivers = team.allDrivers || [team.teamCaptain, ...(team.regularDrivers || [])].filter(Boolean);
    const captainText = team.teamCaptain ? team.teamCaptain : 'No captain selected';

    article.innerHTML = `
        <h3>${team.teamName}</h3>
        <p><strong>Captain:</strong> ${captainText}</p>
        <p><strong>Drivers:</strong> ${drivers.join(', ')}</p>
        <p><strong>Constructors:</strong> ${(team.constructors || []).join(', ')}</p>
        <p><strong>Budget:</strong> $${team.budget} million</p>
        <p><strong>Chip:</strong> ${team.chip}</p>
    `;

    return article;
}

function setupTeamFormPage() {
    const form = document.querySelector('#teamForm');
    const message = document.querySelector('#formMessage');
    const teamName = document.querySelector('#teamName');
    const budget = document.querySelector('#budget');

    if (!form || !message || !teamName || !budget) return;

    teamName.addEventListener('input', function () {
        if (teamName.value.trim().length >= 3) {
            clearFieldError('teamNameError');
        }
    });

    budget.addEventListener('input', function () {
        if (Number(budget.value) > 0) {
            clearFieldError('budgetError');
        }
    });

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        clearAllErrors();

        const driverInputs = document.querySelectorAll('.driver-input');
        const constructorInputs = document.querySelectorAll('.constructor-input');

        const regularDrivers = Array.from(driverInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        const constructors = Array.from(constructorInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        const team = {
            teamName: teamName.value.trim(),
            teamCaptain: document.querySelector('#teamCaptain').value.trim(),
            regularDrivers,
            constructors,
            budget: budget.value,
            chip: document.querySelector('#chip').value
        };

        const error = validateTeam(team);

        if (error) {
            showFieldError(error.field, error.message);
            showFormMessage(error.message, 'error');
            return;
        }

        try {
            const response = await fetch('/api/community-teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(team)
            });

            if (!response.ok) {
                throw new Error('Could not save team');
            }

            showFormMessage(`Added: ${team.teamName}`, 'success');
            form.reset();
            teamName.focus();

        } catch (error) {
            console.error(error);
            showFormMessage('Could not save team. Please try again.', 'error');
        }

        showFormMessage(`Added: ${team.teamName}`, 'success');
        form.reset();
        teamName.focus();
    });
}

function validateTeam(team) {
    if (team.teamName.length < 3) {
        return { field: 'teamNameError', message: 'Team name must be at least 3 characters.' };
    }

    if (team.regularDrivers.length < 2) {
        return { field: 'driversError', message: 'Please enter at least 2 drivers.' };
    }

    if (new Set(team.regularDrivers).size !== team.regularDrivers.length) {
        return { field: 'driversError', message: 'You cannot enter the same driver twice.' };
    }

    if (team.constructors.length < 2) {
        return { field: 'constructorsError', message: 'Please enter 2 constructors.' };
    }

    if (new Set(team.constructors).size !== team.constructors.length) {
        return { field: 'constructorsError', message: 'You cannot enter the same constructor twice.' };
    }

    if (Number(team.budget) <= 0) {
        return { field: 'budgetError', message: 'Budget must be greater than 0.' };
    }

    return null;
}

function showFieldError(fieldId, message) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) field.textContent = message;
}

function clearFieldError(fieldId) {
    const field = document.querySelector(`#${fieldId}`);
    if (field) field.textContent = '';
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(function (errorElement) {
        errorElement.textContent = '';
    });
}

function showFormMessage(text, type) {
    const message = document.querySelector('#formMessage');
    message.textContent = text;
    message.className = `form-message ${type}`;
}
