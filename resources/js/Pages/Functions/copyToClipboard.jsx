import showNotification from "./showNotification";

function copyToClipboard(
    text,
    notification = false,
    successMessage = "",
    successTitle = ""
) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            if (notification) {
                showNotification({
                    message: successMessage,
                    title: successTitle,
                });
            }
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
        });
}

export default copyToClipboard;
