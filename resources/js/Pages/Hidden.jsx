import PinAuthenticate from "./Components/Hidden/PinAuthenticate";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { Text } from "@mantine/core";
import sty from "../../scss/Dashboard.module.scss";
import { IconPhotoOff } from "@tabler/icons-react";
import { useState } from "react";

export default function Hidden({ allowed, title, auth, hasPin }) {
    const [images, setImages] = useState(null);

    const noPicturesFound = (
        <>
            <div className={sty.empty_picture_container}>
                <IconPhotoOff
                    style={{ opacity: 0.9 }}
                    color="var(--mantine-primary-color-filled-hover)"
                    size={"30%"}
                    stroke={1.25}
                />
                <Text className={sty.main}>NO PHOTOS FOUND</Text>
                <Text className={sty.desc}>
                    Looks like you’re so stunning that even the internet couldn’t handle your photos
                </Text>
            </div>
        </>
    );

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
            {!allowed && (
                <PinAuthenticate opened={true} title="" closeButton={false} firstTime={!hasPin} />
            )}
        </AuthLayout>
    );
}