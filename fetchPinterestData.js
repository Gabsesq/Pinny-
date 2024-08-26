// fetchPinterestData.js
import fetch from 'node-fetch';

export async function fetchPins(boardId, accessToken, limit = 8000) {
    let allPins = [];
    let nextBookmark = null;
    let pageCount = 0;

    try {
        do {
            const pinsUrl = new URL(`https://api.pinterest.com/v5/boards/${boardId}/pins`);
            pinsUrl.searchParams.append('page_size', 100); // Set maximum allowed pins per page
            if (nextBookmark) {
                pinsUrl.searchParams.append('bookmark', nextBookmark);
            }

            const response = await fetch(pinsUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            console.log(`Page ${++pageCount} fetched with ${data.items.length} pins.`); // Debugging: Log number of pins fetched per page

            if (!response.ok) {
                console.error('Error message from Pinterest API:', data.message);
                throw new Error(data.message || 'Failed to fetch pins');
            }

            allPins = allPins.concat(data.items); // Add the fetched pins to the array

            nextBookmark = data.bookmark; // Get the bookmark for the next page
            console.log(`Next bookmark: ${nextBookmark}`); // Debugging: Log next bookmark

        } while (nextBookmark && allPins.length < limit); // Continue fetching until we have enough pins or no more pages

        console.log(`Total pins fetched: ${allPins.length}`); // Debugging: Log total number of pins fetched
        return allPins.slice(0, limit); // Return up to the first `limit` number of pins
    } catch (error) {
        console.error('Error fetching pins:', error);
        throw error;
    }
}
