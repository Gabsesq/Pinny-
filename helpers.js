// helpers.js
export function getRandomPins(pins, numPins) {
    const shuffled = pins.sort(() => 0.5 - Math.random()); // Shuffle the array
    return shuffled.slice(0, numPins); // Return a slice of the first `numPins` items
}
