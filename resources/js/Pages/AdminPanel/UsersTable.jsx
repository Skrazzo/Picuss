import { useForm } from "@inertiajs/react";
import { ActionIcon, Menu, Table } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
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

    return (
        <>
            <ConfirmationModal
                opened={deleteForm.data.open}
                close={() => deleteForm.setData("open", false)}
                onConfirm={deleteConfirm}
                icon={<IconTrash />}
                color={"red"}
                title={"Delete user?"}
                loading={deleteForm.processing}
            >
                Are you sure you want to delete <b>{user.username}</b> account?
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
                            <UsersDropDown user={user} deleteForm={deleteForm} />
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
