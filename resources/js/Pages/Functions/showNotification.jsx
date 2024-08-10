import { notifications } from "@mantine/notifications";
import { IconNotification } from "@tabler/icons-react";
import React from "react";

const iconProps = { strokeWidth: 1.5, size: 18 };

const showNotification = ({
    message,
    icon = <IconNotification {...iconProps} />,
    color = "var(--mantine-primary-color-8)",
    title = false,
    withBorder = true,
    withCloseButton = true,
}) => {
    notifications.show({
        icon: React.cloneElement(icon, iconProps),
        title: title,
        message: message,
        color: color,
        withBorder: withBorder,
        withCloseButton: withCloseButton,
    });
};

export default showNotification;
