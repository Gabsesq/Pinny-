import express from 'express';
import { parse } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT || 3000;

const app = express();

// Get the __dirname equivalent for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Function to generate HTML with Pinterest pins
const generateHTML = (pins) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PRE SHUFFLED PINS</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="/styles.css"> <!-- Link to your external CSS file -->
    </head>
    <body>
        <h1>Pinterest Pins</h1>
        <div id="pins">
    `;

    pins.forEach(pin => {
        const imageUrl = pin.media.images['600x'].url; 
        html += `<div class="pin">
                    <img src="${imageUrl}" alt="${pin.alt_text || 'Pin Image'}" class="grid-image" pin-url="${pin.link}" board-name="${pin.board_owner.username}">
                 </div>`;
    });

    html += `
        </div>

        <!-- Image Popup Modal -->
        <div class="modal fade" id="img-popup" tabindex="-1" aria-labelledby="imagePopupLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="imagePopupLabel">Image Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <a id="img-popup-pin-name" href="#" target="_blank">View Pin</a>
                <p id="img-popup-board-name">Board Name</p>
                <img id="img-popup-src" src="" alt="Popup Image">
              </div>
            </div>
          </div>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
        <script>
            // JavaScript to handle image clicks and show modal
            document.addEventListener('DOMContentLoaded', (event) => {
                const imagePopupModal = new bootstrap.Modal(document.getElementById('img-popup'));

                const gridImages = document.getElementsByClassName('grid-image');
                for (const gridImage of gridImages) {
                    gridImage.addEventListener('click', event => {
                        imagePopupModal.show();

                        // Set pin URL.
                        const imagePopupPinElem = document.getElementById('img-popup-pin-name');
                        imagePopupPinElem.setAttribute("href", gridImage.getAttribute('pin-url'));

                        // Set board name.
                        const imagePopupBoardElem = document.getElementById('img-popup-board-name');
                        imagePopupBoardElem.innerText = gridImage.getAttribute('board-name');

                        // Set image source.
                        const imagePopupSource = document.getElementById('img-popup-src');
                        imagePopupSource.setAttribute("src", gridImage.getAttribute('src'));
                    });
                }
            });
        </script>
    </body>
    </html>
    `;
    
    return html;
};

// Route to display a welcome message
app.get('/', (req, res) => {
    res.send('Welcome to the Pinterest API example. Go to /boards to list boards or /pins?boardId=427560627062867576 to fetch pins.');
});

// Route to fetch boards
app.get('/boards', async (req, res) => {
    if (!ACCESS_TOKEN) {
        res.status(401).send('Unauthorized. Access token is missing.');
        return;
    }

    try {
        const boardsUrl = `https://api.pinterest.com/v5/boards`;
        const response = await fetch(boardsUrl, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            res.json(data);
        } else {
            res.status(response.status).json(data);
        }
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).send('Internal Server Error');
    }
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
        const pinsUrl = `https://api.pinterest.com/v5/boards/${boardId}/pins`;
        const response = await fetch(pinsUrl, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            const pinsHtml = generateHTML(data.items);
            res.send(pinsHtml);
        } else {
            console.error(`Error fetching pins: ${response.statusText}`);
            res.status(response.status).json(data);
        }
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
