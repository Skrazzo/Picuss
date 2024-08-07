import { notifications } from "@mantine/notifications";
import { IconNotification } from "@tabler/icons-react";

const showNotification = ({
    message,
    icon = <IconNotification strokeWidth={1.25} size={24} />,
    color = "var(--mantine-primary-color-8)",
    title = false,
    withBorder = true,
    withCloseButton = true,
}) => {
    notifications.show({
        icon: icon,
        title: title,
        message: message,
        color: color,
        withBorder: withBorder,
        withCloseButton: withCloseButton,
    });
};

export default showNotification;
