function hexToRgb(hex) {
    let bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

/**
 * give from and to hex color, and function will return array with n gradient stops and hex colors
 * @param {string} hexColor1 Hex string including #
 * @param {string} hexColor2 Hex string including #
 * @param {int} steps How many gradient steps you want in the array
 * @returns array of hex colors
 */
export default function createGradientArray(hexColor1, hexColor2, steps) {
    let start = hexToRgb(hexColor1);
    let end = hexToRgb(hexColor2);
    let gradient = [];

    for (let i = 0; i <= steps; i++) {
        let r = Math.round(start[0] + ((end[0] - start[0]) * i) / steps);
        let g = Math.round(start[1] + ((end[1] - start[1]) * i) / steps);
        let b = Math.round(start[2] + ((end[2] - start[2]) * i) / steps);
        gradient.push(rgbToHex(r, g, b));
    }

    return gradient;
}
