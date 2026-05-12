const form = document.querySelector("#addForm")
const msg = document.querySelector("#message")
const slider = document.getElementById("budgetSlider");
const output = document.getElementById("output");


//Validation Checks for all elements
function validateForm(teamName, teamCaptain, regularDrivers, budget, constructors, chip) {
    if (!teamName.trim()) return "Team Name is required";
    if (!teamCaptain) return "Captain is required";
    if (regularDrivers.includes("")) return "Please select all 4 regular drivers";
    if (constructors.includes("")) return "Please select both constructors";
    if (!budget) return "Team Cost is required";
    if (!chip) return "Please select whether a chip was used";

    return null;
}

//Outputs the error message if something is missing
function showError(error) {
    msg.textContent = error;
    
    msg.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const teamName = document.querySelector("#teamName").value;
    const teamCaptain = document.querySelector("#teamCaptain").value;

    const driver2 = document.querySelector("#driver2").value;
    const driver3 = document.querySelector("#driver3").value;
    const driver4 = document.querySelector("#driver4").value;
    const driver5 = document.querySelector("#driver5").value;

    const constructor1 = document.querySelector("#constructor1").value;
    const constructor2 = document.querySelector("#constructor2").value;

    const budget = slider.value;

    const selectedChip = document.querySelector("input[name='chip']:checked");
    const chip = selectedChip ? selectedChip.nextElementSibling.textContent : "";

    const regularDrivers = [driver2, driver3, driver4, driver5];
    const allDrivers = [teamCaptain, ...regularDrivers]

    const constructors = [constructor1, constructor2];

    const description = document.querySelector("#description").value.trim();

    const team = {
        teamName,
        teamCaptain,
        regularDrivers,
        allDrivers,
        constructors,
        budget,
        chip,
        description
    }
    
    const error = validateForm(teamName, teamCaptain, regularDrivers, budget, constructors, chip);

    if (error) {
        showError(error);
        return;
    }

    const uniqueDrivers = new Set(allDrivers)
    //Checking if all drivers are unique
    if(uniqueDrivers.size !== allDrivers.length){
        showError("You cannot select the same driver more than once");
        return;
    }

    
    //Checking if all constructors are unique
    const uniqueConstructors = new Set(constructors)
    if(uniqueConstructors.size !== constructors.length){
        showError("You cannot select the same team twice.");
        return;
    }

    //JSON / LocalStorage section
    const savedTeams = JSON.parse(localStorage.getItem("fantasyTeams")) || [];//gets the existing saved teams from localStorage. If there are none, it starts with an empty array.
    savedTeams.push(team);//adds the new submitted team to the array.
    localStorage.setItem("fantasyTeams", JSON.stringify(savedTeams));//Converts the array into text and saves it on the browser

    msg.textContent = "Added: " + teamName;

    form.reset();
    output.textContent = slider.value;
    document.querySelector("#teamName").focus();
});

//Updates the value of the Budget Slider as it's being moved
slider.addEventListener("input", function() { 
    output.textContent = slider.value;
});