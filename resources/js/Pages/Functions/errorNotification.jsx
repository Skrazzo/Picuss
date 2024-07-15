import { IconBug } from "@tabler/icons-react";
import showNotification from "./showNotification";

const iconProps = {
    strokeWidth: 1.25,
    size: 20,
};

function errorNotification(err) {
    console.error(err);

    let errMessage =
        JSON.stringify(err.response.data) ||
        `${err.message} at ${err.request.responseURL}`;

    showNotification({
        color: "red",
        icon: <IconBug {...iconProps} />,
        title: `${err.response.status} - ${err.response.statusText}`,
        message: errMessage,
    });
}

export default errorNotification;
