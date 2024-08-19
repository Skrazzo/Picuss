import React, { useEffect, useState } from "react";
import GuestLayout from "./Layouts/GuestLayout";
import "../../scss/ViewSharedImage.scss";
import { ActionIcon, AspectRatio, Button, Container, Flex, Paper, Text } from "@mantine/core";
import { IconDownload, IconX } from "@tabler/icons-react";
// import { LazyLoadImage } from "react-lazy-load-image-component";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import LazyLoadImage from "./Components/LazyLoadImage";
import calculateImageSize from "./Functions/calculateImageSize";

export default function ViewSharedImage({ thumb, picture }) {
    const [selected, setSelected] = useState({ open: false, blobUrl: null });
    const [fullSize, setFullSize] = useState(
        calculateImageSize(
            [window.innerWidth, window.innerHeight],
            [picture.width, picture.height],
        ),
    );

    const iconProps = {
        size: 20,
        strokeWidth: 1.25,
    };

    const calcAvailSize = () => {
        setFullSize(
            calculateImageSize(
                [window.innerWidth, window.innerHeight],
                [picture.width, picture.height],
            ),
        );
    };

    useEffect(() => {
        window.addEventListener("resize", calcAvailSize);
        return () => {
            window.removeEventListener("scroll", calcAvailSize);
        };
    }, []);

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
                        onClick={() =>
                            (window.location.href = route("share.download.image", picture.id))
                        }
                    >
                        {picture.size} MB
                    </Button>
                </Flex>

                <Paper mt={16}>
                    <LazyLoadImage
                        id="image"
                        thumbnail={thumb}
                        src={route("share.get.image", picture.id)}
                        className="image"
                        onClick={(id, url) => setSelected({ open: true, blobUrl: url })}
                        containerStyle={{ aspectRatio: `1/${picture.aspectRatio}` }}
                    />
                </Paper>
            </Container>

            <AnimatePresence>
                {selected.open && (
                    <motion.div
                        initial={{
                            backgroundColor: "rgba(0,0,0,0)",
                            backdropFilter: "blur(0px)",
                        }}
                        animate={{
                            backgroundColor: "rgba(0,0,0,0.2)",
                            backdropFilter: "blur(10px)",
                        }}
                        exit={{
                            backgroundColor: "rgba(0,0,0,0)",
                            backdropFilter: "blur(0px)",
                        }}
                        className="overlay"
                        onClick={() => setSelected({ open: false, blobUrl: null })}
                    >
                        <motion.img
                            layoutId="image"
                            src={selected.blobUrl}
                            style={{
                                width: fullSize[0],
                                height: fullSize[1],
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />

                        <motion.div
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            exit={{ y: -50 }}
                            className="exit-btn"
                        >
                            <ActionIcon
                                onClick={() => setSelected({ open: false, blobUrl: null })}
                                variant="light"
                            >
                                <IconX />
                            </ActionIcon>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GuestLayout>
    );
}
