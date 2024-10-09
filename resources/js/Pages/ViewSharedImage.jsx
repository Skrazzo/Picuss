import React from "react";
import GuestLayout from "./Layouts/GuestLayout";
import "../../scss/ViewSharedImage.scss";
import { Button, Container, Flex, Paper, Text } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import LazyLoadImage from "./Components/LazyLoadImage";
import { PhotoProvider, PhotoView } from "react-photo-view";

export default function ViewSharedImage({ thumb, picture }) {
    const iconProps = {
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <GuestLayout>
            <Container mt={32} size={"sm"}>
                <Flex justify={"space-between"} align={"center"}>
                    <Text className={"green_text image-name"} fw={"bold"}>
                        {picture.name}
                    </Text>

                    <Button
                        miw={"max-content"}
                        rightSection={<IconDownload {...iconProps} />}
                        onClick={() => (window.location.href = route("share.download.image", picture.id))}
                    >
                        {picture.size} MB
                    </Button>
                </Flex>

                <PhotoProvider bannerVisible={false}>
                    <Paper mt={16}>
                        <PhotoView src={route("share.get.image", picture.id)}>
                            <LazyLoadImage
                                id="image"
                                thumbnail={thumb}
                                src={route("share.get.image", picture.id)}
                                className="image"
                                containerStyle={{ aspectRatio: `1/${picture.aspectRatio}` }}
                            />
                        </PhotoView>
                    </Paper>
                </PhotoProvider>
            </Container>
        </GuestLayout>
    );
}
