import http from 'http';
import { parse } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const PORT = process.env.PORT || 3000;

const generateHTML = (pins) => {
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pinterest Pins</title>
    </head>
    <body>
        <h1>Pinterest Pins</h1>
        <div id="pins">
    `;

    pins.forEach(pin => {
        html += `<div class="pin"><img src="${pin.media.image_url}" alt="${pin.alt_text || 'Pin Image'}"></div>`;
    });

    html += `
        </div>
    </body>
    </html>
    `;
    
    return html;
};

const server = http.createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`Incoming request: ${pathname}`);

    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('Welcome to the Pinterest API example. Go to /boards to list boards or /pins?boardId=427560627062867576 to fetch pins.');
    } else if (pathname === '/boards') {
        if (!ACCESS_TOKEN) {
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end('Unauthorized. Access token is missing.');
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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data, null, 2));
            } else {
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error('Error fetching boards:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
        }
    } else if (pathname === '/pins') {
        if (!ACCESS_TOKEN) {
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end('Unauthorized. Please authorize the app first.');
            return;
        }

        const boardId = parsedUrl.query.boardId;

        if (!boardId) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('Board ID is required.');
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
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(pinsHtml);
            } else {
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data, null, 2));
            }
        } catch (error) {
            console.error('Error fetching pins:', error);
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Go to http://localhost:${PORT}/ to start`);
});
