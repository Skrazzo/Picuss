/**
 * Returns true if current theme is dark, and false if current theme is light
 * @returns true or false
 */
export default function checkDarkMode() {
    let dark = localStorage.getItem("picuss-dark");

    if (dark === null || dark === "false") {
        return false;
    }
    return true;
}
