# The Grand Prix Network

The Grand Prix Network is a Formula 1 fan website with news, race recaps, standings, fantasy tips, and community fantasy teams. It uses localStorage for saved teams, a public weather API for the next race, and a small Node.js server for a JSON community teams endpoint.

## Install dependencies

```bash
npm install
```

## Start the server

```bash
node server.js
```

Then open:

```text
http://localhost:3000
```

## API information

Third-party API used: Open-Meteo

URL used in the project:

```text
https://api.open-meteo.com/v1/forecast
```

It provides current weather data for the next race location, including temperature, precipitation, and wind speed.

Own Node.js endpoint:

```text
http://localhost:3000/api/community-teams
```

This returns the community fantasy teams stored in `community-teams.json`.