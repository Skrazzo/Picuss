import React from "react";
import AuthLayout from "../Layouts/AuthLayout";
import Title from "../Components/Title";
import { Container } from "@mantine/core";
import SectionTitle from "../Components/SectionTitle";
import { IconUsers } from "@tabler/icons-react";

export default function Admin({ auth, title = "Admin", users = [] }) {
    console.log(users);

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />

            <Container size={"md"} py={"md"}>
                <SectionTitle icon={<IconUsers size={20} />} text="Users" />
            </Container>
        </AuthLayout>
    );
}
