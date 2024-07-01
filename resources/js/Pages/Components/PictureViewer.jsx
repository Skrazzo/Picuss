import React, { useEffect, useState } from "react";
import sty from "../../../scss/PictureViewer.module.scss";
import {
    ActionIcon,
    Button,
    Checkbox,
    Menu,
    Paper,
    Table,
    Text,
} from "@mantine/core";
import {
    IconBan,
    IconChevronLeft,
    IconChevronRight,
    IconDeviceFloppy,
    IconDotsVertical,
    IconFileInfo,
    IconTags,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";
import axios from "axios";
import showNotification from "../Functions/showNotification";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function PictureViewer({
    selected,
    setSelected,
    images,
    tags,
    onDelete,
    close,
}) {
    // Find image and recheck if it exists
    const image = images.filter((x) => x.id === selected)[0] || {};
    if (!("id" in image)) return <></>;

    // current images index
    const imageIndex = images.findIndex((x) => x.id === image.id);

    // Use states
    const [selectedTags, setSelectedTags] = useState(image.tags);

    console.log(image);
    console.log(tags);
    console.log(selectedTags);

    const SectionTitle = ({ text, icon, rightSection = <></> }) => (
        <div className={sty.section_title}>
            <div>
                {icon}
                <Text>{text}</Text>
            </div>
            {rightSection}
        </div>
    );

    const fileInfo = [
        ["Size", `${image.size} MB`],
        ["Upload Date", image.uploaded],
        ["Uploaded", image.uploaded_ago],
    ];

    const fileInfoRows = fileInfo.map((row) => (
        <Table.Tr>
            <Table.Td>{row[0]}</Table.Td>
            <Table.Td>{row[1]}</Table.Td>
        </Table.Tr>
    ));

    function tagHandler(id) {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter((tag) => tag !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    }

    function saveTags() {
        if (selectedTags.length === 0) return;

        let data = {
            tags: selectedTags,
        };

        axios
            .put(route("edit.tags", image.id), data)
            .then((res) => showNotification({ message: "Saved tags" }))
            .catch((err) => {
                alert("Error happened! " + error);
                console.error(err);
            });
    }

    function deletePicture() {
        axios
            .delete(route("delete.picture", image.id))
            .then(() => onDelete(image.id))
            .catch((err) => {
                alert("Error appeared! " + err);
                console.error(err);
            });
    }

    function previousImage() {
        if (imageIndex === 0) return;

        setSelected(images[imageIndex - 1].id);
    }

    function nextImage() {
        if (imageIndex === images.length - 1) return;

        setSelected(images[imageIndex + 1].id);
    }

    return (
        <div className={sty.container}>
            <div className={sty.side}>
                <div>
                    <div className={sty.title}>
                        <Text
                            size={"20px"}
                            fw={600}
                            className={`${sty.green_text}`}
                        >
                            {image.name}
                        </Text>

                        <Menu>
                            <Menu.Target>
                                <ActionIcon variant="subtle">
                                    <IconDotsVertical />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    onClick={deletePicture}
                                    color={"red"}
                                    leftSection={<IconTrash size={16} />}
                                >
                                    <Text mt={2}>Delete</Text>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>

                    <SectionTitle text={"File"} icon={<IconFileInfo />} />
                    <div className={sty.info_container}>
                        <Table>
                            <Table.Tbody>{fileInfoRows}</Table.Tbody>
                        </Table>
                    </div>

                    <SectionTitle
                        text={"Tags"}
                        icon={<IconTags />}
                        rightSection={
                            <ActionIcon variant="subtle">
                                {selectedTags.length === 0 ? (
                                    <IconBan />
                                ) : (
                                    <IconDeviceFloppy onClick={saveTags} />
                                )}
                            </ActionIcon>
                        }
                    />
                    <div className={sty.info_container}>
                        <Paper
                            p={"0.5rem"}
                            withBorder
                            className={sty.checkboxes}
                        >
                            {tags.map((tag, idx) => (
                                <Checkbox
                                    size="18px"
                                    key={idx}
                                    mt={idx === 0 ? 0 : 8}
                                    onChange={() => tagHandler(tag.id)}
                                    defaultChecked={selectedTags.includes(
                                        tag.id
                                    )}
                                    label={capitalizeFirstLetter(tag.name)}
                                />
                            ))}
                        </Paper>
                    </div>
                </div>

                <div className={sty.buttons}>
                    {imageIndex !== 0 && (
                        <Button
                            variant="default"
                            leftSection={<IconChevronLeft />}
                            onClick={previousImage}
                        >
                            Previous
                        </Button>
                    )}

                    {imageIndex !== images.length - 1 && (
                        <Button
                            variant="default"
                            rightSection={<IconChevronRight />}
                            onClick={nextImage}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </div>

            <div className={sty.picture_container}>
                <ActionIcon
                    onClick={close}
                    variant="light"
                    className={sty.closeBtn}
                >
                    <IconX />
                </ActionIcon>

                <div className={sty.picture}>
                    <LazyLoadImage
                        placeholderSrc={image.thumb}
                        src={route("get.image", image.id)}
                        effect="blur"
                    />
                </div>
            </div>
        </div>
    );
}
