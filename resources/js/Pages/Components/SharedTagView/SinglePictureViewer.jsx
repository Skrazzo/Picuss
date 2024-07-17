import { Table, Text } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import SectionTitle from "../SectionTitle";
import { IconDownload, IconFileInfo, IconX } from "@tabler/icons-react";
import LazyLoadImage from "../LazyLoadImage";
import calculateImageSize from "../../Functions/calculateImageSize";

export default function SinglePictureViewer({
    opened,
    close,
    pictures,
    selected,
}) {
    let tmp = pictures.filter((pic) => pic.id === selected[0]);
    let image = null;

    if (tmp.length === 1) {
        image = tmp[0];
    }

    // Calculate images size before render
    const [imageSize, setImageSize] = useState(
        calculateImageSize(
            [window.innerWidth, window.innerHeight],
            [image.width, image.height]
        )
    );

    const [screenSize, setScreenSize] = useState([
        window.innerWidth,
        window.innerHeight,
    ]);
    const [infoHover, setInfoHover] = useState(false);

    const fileInfo = [
        ["Size", `${image.size} MB`],
        ["Dimensions", `${image.width} x ${image.height}`],
    ];

    const fileInfoRows = fileInfo.map((row, idx) => (
        <Table.Tr key={idx}>
            <Table.Td>{row[0]}</Table.Td>
            <Table.Td>{row[1]}</Table.Td>
        </Table.Tr>
    ));

    useEffect(() => {
        const handleResize = () =>
            setScreenSize([window.innerWidth, window.innerHeight]);

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setImageSize(
            calculateImageSize(screenSize, [image.width, image.height])
        );
    }, [screenSize]);

    // useEffect(() => console.log(image), [image]);

    const optionIconProps = {
        strokeWidth: 1.25,
        size: "24px",
        color: "green",
        style: { cursor: "pointer" },
    };

    return (
        <AnimatePresence>
            {opened && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="share-tag-viewer"
                    onClick={close}
                >
                    <motion.div
                        className="option-card"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                    >
                        <div className="file-info">
                            <motion.div
                                onHoverStart={() => setInfoHover(true)}
                                onHoverEnd={() => setInfoHover(false)}
                                onClick={() => setInfoHover(true)}
                                className="d-flex"
                            >
                                <IconFileInfo {...optionIconProps} />
                            </motion.div>

                            <AnimatePresence>
                                {infoHover && (
                                    <motion.div
                                        initial={{ y: 32, opacity: 0 }}
                                        animate={{ y: 40, opacity: 1 }}
                                        exit={{ y: 32, opacity: 0 }}
                                        onClick={() => setInfoHover(false)}
                                        className="container"
                                    >
                                        <Text
                                            size={"16px"}
                                            fw={600}
                                            className="green_text"
                                        >
                                            {image.name}
                                        </Text>

                                        <Table mt={8}>
                                            <Table.Tbody>
                                                {fileInfoRows}
                                            </Table.Tbody>
                                        </Table>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <IconDownload
                            {...optionIconProps}
                            onClick={() =>
                                window.open(
                                    route("share.download.image", image.id),
                                    "_blank"
                                )
                            }
                        />
                        <IconX {...optionIconProps} onClick={close} />
                    </motion.div>

                    <LazyLoadImage
                        id={image.id}
                        thumbnail={selected[1]}
                        src={route("share.tags.get.picture", image.id)}
                        blur={false}
                        className="picture"
                        style={{
                            width: imageSize[0],
                            height: imageSize[1],
                        }}
                        useLayoutId={true}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
