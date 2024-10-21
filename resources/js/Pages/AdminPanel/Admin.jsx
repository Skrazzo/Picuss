import React from "react";
import AuthLayout from "../Layouts/AuthLayout";
import Title from "../Components/Title";
import { Container, ScrollArea } from "@mantine/core";
import SectionTitle from "../Components/SectionTitle";
import { IconUsers } from "@tabler/icons-react";
import UsersTable from "./UsersTable";

export default function Admin({ auth, title = "Admin", users = [] }) {
    return (
        <AuthLayout auth={auth}>
            <Title title={title} />

            <Container size={"md"} py={"md"}>
                <SectionTitle icon={<IconUsers size={20} />} text="Users" />
                <ScrollArea w={"100%"} scrollbarSize={4}>
                    <UsersTable users={users} />
                </ScrollArea>
            </Container>
        </AuthLayout>
    );
}
