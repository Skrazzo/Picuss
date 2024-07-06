import React, { useState } from "react";
import GuestLayout from "./Layouts/GuestLayout";
import "../../scss/ViewSharedImage.scss";
import {
    ActionIcon,
    Button,
    Container,
    Flex,
    Paper,
    Text,
} from "@mantine/core";
import { IconDownload, IconX } from "@tabler/icons-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";

export default function ViewSharedImage({ thumb, picture }) {
    const [selected, setSelected] = useState(null);

    return (
        <GuestLayout>
            <Container mt={32} size={"sm"}>
                <Flex justify={"space-between"} align={"center"}>
                    <Text className={"green_text image-name"} fw={"bold"}>
                        {picture.name}
                    </Text>

                    <Button
                        miw={"max-content"}
                        rightSection={<IconDownload size={16} />}
                        onClick={() =>
                            (window.location.href = route(
                                "share.download.image",
                                picture.id
                            ))
                        }
                    >
                        {picture.size} MB
                    </Button>
                </Flex>

                <Paper mt={16}>
                    <motion.div layoutId="image">
                        <LazyLoadImage
                            style={{ opacity: selected ? 0 : 1 }}
                            className="image"
                            placeholderSrc={thumb}
                            src={route("share.get.image", picture.id)}
                            effect="blur"
                            onClick={() => setSelected(true)}
                        />
                    </motion.div>
                </Paper>
            </Container>

            <AnimatePresence>
                {selected && (
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
                    >
                        <motion.img
                            layoutId="image"
                            src={route("share.get.image", picture.id)}
                        />

                        <motion.div
                            initial={{ y: -50 }}
                            animate={{ y: 0 }}
                            exit={{ y: -50 }}
                            className="exit-btn"
                        >
                            <ActionIcon
                                onClick={() => setSelected(null)}
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
