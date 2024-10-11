import { useForm } from "@inertiajs/react";
import { ActionIcon, Table } from "@mantine/core";
import { IconDotsVertical } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

function UserTableRow({ user }) {
    const [hovered, setHovered] = useState(false);

    return (
        <Table.Tr onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Table.Td>{user.id}</Table.Td>
            <Table.Td>{user.username}</Table.Td>
            <Table.Td>{user.images_count}</Table.Td>
            <Table.Td>{user.images_size}</Table.Td>
            <Table.Td>{user.tags_count}</Table.Td>
            <Table.Td>{user.created_ago}</Table.Td>
            <Table.Td>
                <ActionIcon opacity={hovered ? 1 : 0}>
                    <IconDotsVertical />
                </ActionIcon>
            </Table.Td>
        </Table.Tr>
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
