import PinAuthenticate from "./Components/Hidden/PinAuthenticate";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { Text } from "@mantine/core";

export default function Hidden({ allowed, title, auth, hasPin }) {
    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
            {!allowed && (
                <PinAuthenticate opened={true} title="" closeButton={false} firstTime={hasPin} />
            )}
        </AuthLayout>
    );
}
