import { useForm } from "@inertiajs/inertia-react";
import { ActionIcon, Flex, Input, InputWrapper, Menu, Progress, Table, Text, Tooltip } from "@mantine/core";
import { IconCloud, IconDotsVertical, IconPasswordUser, IconTrash } from "@tabler/icons-react";
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

    const changeLimitForm = useForm({
        open: false,
        user_id: user.id,
        limit: user.limit ? user.limit : "",
    });

    const changeLimitConfirm = () => {
        changeLimitForm.put(route("admin.change.limit"), {
            onSuccess: () => changeLimitForm.reset("open"),
            onError: (err) => console.warn(err),
        });
    };

    const TimeDiffComponent = ({ date = null }) => {
        if (!date) {
            return <Text size="sm">Never</Text>;
        }

        return (
            <Tooltip label={date.date || "No date"} withArrow>
                <Text size="sm">{date.human || "No human readable date"}</Text>
            </Tooltip>
        );
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

            {/* Change user limit modal */}
            <ConfirmationModal
                opened={changeLimitForm.data.open}
                close={() => changeLimitForm.setData("open", false)}
                onConfirm={changeLimitConfirm}
                icon={<IconCloud />}
                color={"green"}
                title={"Change limit"}
                childrenText={false}
                confirmBtnText="Change limit"
                closeOnConfirm={false}
                loading={changeLimitForm.processing}
            >
                <Text c={"dimmed"} mt={8}>
                    Select new limit for {user.username}. Write limit in <b>GB</b>. <b>Write 0 to remove limit</b>
                </Text>
                <InputWrapper mt={8} error={changeLimitForm.errors.limit}>
                    <Input
                        placeholder="New limit"
                        onChange={(e) => changeLimitForm.setData("limit", e.target.value)}
                        value={changeLimitForm.data.limit}
                        error={changeLimitForm.errors.limit}
                    />
                </InputWrapper>
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
                    <Flex justify={"space-between"}>
                        <Text size="sm">
                            {user.images_size > 1024
                                ? `${Math.round((user.images_size / 1024) * 100) / 100} GB`
                                : `${user.images_size} MB`}
                        </Text>

                        {user.limit && (
                            <Text size="sm">
                                {user.limit < 1 ? Math.round(user.limit * 1024 * 100) / 100 : user.limit}{" "}
                                {user.limit < 1 ? "MB" : "GB"}
                            </Text>
                        )}
                    </Flex>

                    {user.limit && <Progress value={(user.images_size * 100) / (user.limit * 1024)} />}
                </Table.Td>
                <Table.Td>{user.tags_count}</Table.Td>
                <Table.Td>
                    <TimeDiffComponent date={user.last_visit} />
                </Table.Td>
                <Table.Td>
                    <TimeDiffComponent date={user.last_upload} />
                </Table.Td>
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
                                changeLimitForm={changeLimitForm}
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
                    <Table.Th>Last login</Table.Th>
                    <Table.Th>Last upload</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{tableBody}</Table.Tbody>
        </Table>
    );
}
