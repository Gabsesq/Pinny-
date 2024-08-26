// app.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { fetchPins } from './fetchPinterestData.js';
import { generateHTML } from './generateHTML.js';
import { getRandomPins } from './helpers.js';

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Route to display a welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the Pinterest API example. Go to /boards to list boards or /pins?boardId=427560627062867576 to fetch pins.');
});

// Route to fetch pins
app.get('/pins', async (req, res) => {
    if (!ACCESS_TOKEN) {
        res.status(401).send('Unauthorized. Please authorize the app first.');
        return;
    }

    const boardId = req.query.boardId;
    console.log('Board ID:', boardId); // Debugging: Log board ID

    if (!boardId) {
        res.status(400).send('Board ID is required.');
        return;
    }

    try {
        const allPins = await fetchPins(boardId, ACCESS_TOKEN, 8000); // Fetch up to 8000 pins
        const randomPins = getRandomPins(allPins, 50); // Get a random subset of 50 pins
        const pinsHtml = generateHTML(randomPins);
        res.send(pinsHtml);
    } catch (error) {
        console.error('Error fetching pins:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Go to http://localhost:${PORT}/ to start`);
});
