// generateHTML.js
export function generateHTML(pins) {
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
}
