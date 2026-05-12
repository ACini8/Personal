const teamsContainer = document.querySelector("#teamsContainer");
const savedTeams = JSON.parse(localStorage.getItem("fantasyTeams")) || [];

if (savedTeams.length === 0) {
    teamsContainer.textContent = "No fantasy teams have been submitted yet.";
} else {
    savedTeams.forEach(function(team) {
        const article = document.createElement("article");
        article.classList.add("team-card");

        article.innerHTML = `
            <h3>${team.teamName}</h3>
            <p><strong>Captain:</strong> ${team.teamCaptain}</p>
            <p><strong>Drivers:</strong> ${team.allDrivers.join(", ")}</p>
            <p><strong>Constructors:</strong> ${team.constructors.join("and ")}</p>
            <p><strong>Budget:</strong> £${team.budget} Million</p>
            <p><strong>Chip:</strong> ${team.chip}</p>
            ${team.description ? `<p><strong>Description:</strong> ${team.description}</p>` : ""}
        `;

        teamsContainer.appendChild(article);
    });
}

const serverTeamsContainer = document.querySelector("#serverTeamsContainer");

async function loadServerTeams() {
    serverTeamsContainer.textContent = "Loading featured teams...";

    try {
        const response = await fetch("http://localhost:3000/api/community-teams");

        if (!response.ok) {
            throw new Error("Could not fetch server teams");
        }

        const teams = await response.json();

        serverTeamsContainer.innerHTML = "";

        teams.forEach(function(team) {
            const article = document.createElement("article");
            article.classList.add("team-card");

            article.innerHTML = `
                <h3>${team.teamName}</h3>
                <p><strong>Captain:</strong> ${team.teamCaptain}</p>
                <p><strong>Drivers:</strong> ${team.regularDrivers.join(", ")}</p>
                <p><strong>Constructors:</strong> ${team.constructors.join(", ")}</p>
                <p><strong>Budget:</strong> £${team.budget} Million</p>
                <p><strong>Chip:</strong> ${team.chip}</p>
            `;

            serverTeamsContainer.appendChild(article);
        });
    } catch (error) {
        serverTeamsContainer.textContent = "Could not load featured community teams.";
    }
}

loadServerTeams();