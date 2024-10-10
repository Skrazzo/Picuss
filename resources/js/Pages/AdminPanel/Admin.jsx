import React from "react";
import AuthLayout from "../Layouts/AuthLayout";
import Title from "../Components/Title";

export default function Admin({ auth, title = "Admin" }) {
    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
        </AuthLayout>
    );
}
