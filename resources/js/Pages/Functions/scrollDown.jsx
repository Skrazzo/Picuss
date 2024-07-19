function scrollDown({ timeout = true, timeoutMS = 500 }) {
    if (timeout) {
        setTimeout(() => {
            scroll();
        }, timeoutMS);
    } else {
        scroll();
    }
}

function scroll() {
    const element = document.getElementById("bottom-section");
    if (element) {
        // 👇 Will scroll smoothly to the top of the next section
        element.scrollIntoView({ behavior: "smooth" });
    }
}

export default scrollDown;
