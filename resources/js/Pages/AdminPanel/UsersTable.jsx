import { useForm } from "@inertiajs/inertia-react";
import { ActionIcon, Input, InputWrapper, Menu, Table, Text } from "@mantine/core";
import { IconDotsVertical, IconPasswordUser, IconTrash } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import UsersDropDown from "./UsersDropDown";
import ConfirmationModal from "../Components/ConfirmationModal";

function UserTableRow({ user }) {
    const [hovered, setHovered] = useState(false);

    const deleteForm = useForm({
        open: false,
        user_id: user.id,
    });

    const deleteConfirm = () => {
        deleteForm.delete(route("admin.delete.user"));
    };

    const changePasswordForm = useForm({
        open: false,
        user_id: user.id,
        new_password: "",
    });

    const changeConfirm = () => {
        changePasswordForm.post(route("admin.change.password"), {
            onSuccess: () => changePasswordForm.reset(),
            onError: (err) => console.warn(err),
        });
    };

    return (
        <>
            {/* Delete user modal */}
            <ConfirmationModal
                opened={deleteForm.data.open}
                close={() => deleteForm.setData("open", false)}
                onConfirm={deleteConfirm}
                closeOnConfirm={false}
                icon={<IconTrash />}
                color={"red"}
                title={"Delete user?"}
                loading={deleteForm.processing}
            >
                Are you sure you want to delete <b>{user.username}</b> account?
            </ConfirmationModal>

            {/* Change password modal */}
            <ConfirmationModal
                opened={changePasswordForm.data.open}
                close={() => changePasswordForm.setData("open", false)}
                onConfirm={changeConfirm}
                icon={<IconPasswordUser />}
                color={"green"}
                title={"Change password"}
                childrenText={false}
                confirmBtnText="Change password"
                closeOnConfirm={false}
                loading={changePasswordForm.processing}
            >
                <Text c={"dimmed"} mt={8}>
                    Select new password for {user.username}
                </Text>
                <InputWrapper mt={8} error={changePasswordForm.errors.new_password}>
                    <Input
                        placeholder="New password"
                        onChange={(e) => changePasswordForm.setData("new_password", e.target.value)}
                        value={changePasswordForm.data.new_password}
                        name="new_password"
                        error={changePasswordForm.errors.new_password}
                    />
                </InputWrapper>
            </ConfirmationModal>
            <Table.Tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <Table.Td>{user.id}</Table.Td>
                <Table.Td>{user.username}</Table.Td>
                <Table.Td>{user.images_count}</Table.Td>
                <Table.Td>
                    {user.images_size > 1000 ? `${user.images_size / 1000} GB` : `${user.images_size} MB`}
                </Table.Td>
                <Table.Td>{user.tags_count}</Table.Td>
                <Table.Td>{user.created_ago}</Table.Td>
                <Table.Td>
                    <Menu shadow="md">
                        <Menu.Target>
                            <ActionIcon opacity={hovered ? 1 : 0} variant="light">
                                <IconDotsVertical />
                            </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown title={`${user.username} options`}>
                            <UsersDropDown
                                user={user}
                                deleteForm={deleteForm}
                                changePasswordForm={changePasswordForm}
                            />
                        </Menu.Dropdown>
                    </Menu>
                </Table.Td>
            </Table.Tr>
        </>
    );
}

export default function UsersTable({ users = [] }) {
    let [tableBody, setTableBody] = useState([]);

    useEffect(() => {
        setTableBody(users.map((user) => <UserTableRow user={user} key={user.id} />));
    }, [users]);

    return (
        <Table mt={16} miw={600}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Username</Table.Th>
                    <Table.Th>Images</Table.Th>
                    <Table.Th>Space used</Table.Th>
                    <Table.Th>Tags</Table.Th>
                    <Table.Th>User created</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableBody}</Table.Tbody>
        </Table>
    );
}
