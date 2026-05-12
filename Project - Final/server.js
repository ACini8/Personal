const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

const publicFolder = path.join(__dirname, 'public');
const imagesFolder = path.join(publicFolder, 'images');
const teamsFile = path.join(__dirname, 'community-teams.json');

app.use(express.json());

// Serve all files inside /public, such as home.html, style.css, and app.js.
app.use(express.static(publicFolder));

// Serve images directly too, so old links such as logo.png still work.
app.use(express.static(imagesFolder));

// Homepage.
app.get('/', (req, res) => {
    res.sendFile(path.join(publicFolder, 'home.html'));
});

// Keep these simple URLs working even though the real file names are different.
app.get('/teams.html', (req, res) => {
    res.sendFile(path.join(publicFolder, 'communityteams.html'));
});

app.get('/add-team.html', (req, res) => {
    res.sendFile(path.join(publicFolder, 'form.html'));
});

// Some pages ask for styles.css, but the actual file is called style.css.
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(publicFolder, 'style.css'));
});

// Navigation used by article1.html and article2.html.
app.get('/nav', (req, res) => {
    res.type('html').send(`
        <nav>
            <ul>
                <li><a href="home.html">Home</a></li>
                <li><a href="news.html">News</a></li>
                <li><a href="racerecaps.html">Race Recaps</a></li>
                <li><a href="standings.html">Standings</a></li>
                <li><a href="f1fantasy.html">F1 Fantasy</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    `);
});

// JSON endpoint for the assignment requirement.
app.get('/api/community-teams', async (req, res) => {
    try {
        const data = await fs.readFile(teamsFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Could not read community teams file' });
    }
});

// Saves a submitted team to the JSON file.
app.post('/api/community-teams', async (req, res) => {
    try {
        const newTeam = req.body;

        if (!newTeam.teamName || !Array.isArray(newTeam.regularDrivers)) {
            return res.status(400).json({ error: 'Team name and drivers are required' });
        }

        const data = await fs.readFile(teamsFile, 'utf8');
        const teams = JSON.parse(data);

        teams.push(newTeam);
        await fs.writeFile(teamsFile, JSON.stringify(teams, null, 4));

        res.status(201).json({ message: 'Team added successfully', team: newTeam });
    } catch (error) {
        res.status(500).json({ error: 'Could not save community team' });
    }
});

app.use((req, res) => {
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log('========================================');
    console.log('The Grand Prix Network is running!');
    console.log(`http://localhost:${PORT}`);
    console.log('========================================');
});
