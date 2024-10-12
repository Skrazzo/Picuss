import { Menu } from "@mantine/core";
import { IconCloud, IconPasswordUser, IconTrash } from "@tabler/icons-react";

export default function UsersDropDown(props) {
    const iconProps = {
        strokeWidth: 1.5,
        size: 18,
    };

    return (
        <>
            <Menu.Label>{props.user.username} options</Menu.Label>

            <Menu.Item
                leftSection={<IconPasswordUser {...iconProps} />}
                onClick={() => props.changePasswordForm.setData("open", true)}
            >
                Change password
            </Menu.Item>
            <Menu.Item leftSection={<IconCloud {...iconProps} />}>Change storage limit</Menu.Item>
            <Menu.Divider />
            <Menu.Item
                c={"red"}
                leftSection={<IconTrash {...iconProps} />}
                onClick={() => props.deleteForm.setData("open", true)}
            >
                Delete user
            </Menu.Item>
        </>
    );
}
