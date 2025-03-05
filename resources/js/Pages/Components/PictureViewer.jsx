import React, { useEffect, useRef, useState } from "react";
import sty from "../../../scss/PictureViewer.module.scss";
import { ActionIcon, Checkbox, Menu, Paper, Table, Text, Tooltip } from "@mantine/core";
import {
    IconCopy,
    IconDotsVertical,
    IconDownload,
    IconFileInfo,
    IconInfoCircleFilled,
    IconInfoHexagon,
    IconRobot,
    IconShare,
    IconShareOff,
    IconTags,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";
import axios from "axios";
import showNotification from "../Functions/showNotification";
import { useDisclosure } from "@mantine/hooks";
import ConfirmationModal from "./ConfirmationModal";
import copyToClipboard from "../Functions/copyToClipboard";
import PictureViewerSubTags from "./PictureViewerSubTags";

export default function PictureViewer({
    selected,
    setSelected,
    images,
    tags,
    onDelete,
    close,
    hiddenImages = false,
    sub_tags_enabled = false,
}) {
    // Find image and recheck if it exists
    const image = images[selected];
    if (!("id" in image)) return <></>;

    console.log("idx", selected);
    console.log("after", images);

    // Use states
    const [selectedTags, setSelectedTags] = useState(image.tags);
    const [shared, setShared] = useState(image.shared);
    const [confirmDelete, setConfirmDelete] = useDisclosure(false);

    // use refs
    const firstLoad = useRef(true);

    // console.log(image);
    // console.log(tags);
    // console.log(selectedTags);

    useEffect(() => {
        firstLoad.current = true; // set this to true, so selected tags useeffect does not refresh
        setShared(image.shared);
    }, [image]);

    let d = new Date(image.uploaded);
    let formatedDate = d.toDateString();

    const fileInfo = [
        ["Size", `${image.size} MB`],
        ["Upload Date", formatedDate],
        ["Uploaded", image.uploaded_ago],
        ["Dimensions", `${image.width} x ${image.height}`],
    ];

    const fileInfoRows = fileInfo.map((row, idx) => (
        <Table.Tr key={idx}>
            <Table.Td>{row[0]}</Table.Td>
            <Table.Td>{row[1]}</Table.Td>
        </Table.Tr>
    ));

    function tagHandler(id) {
        if (selectedTags.includes(id)) {
            if (selectedTags.length === 1) {
                showNotification({
                    color: "red",
                    title: "Not allowed",
                    message: "Each image has to have at least one tag, that's why you cannot remove it.",
                    icon: <IconInfoCircleFilled />,
                });
            } else {
                setSelectedTags(selectedTags.filter((tag) => tag !== id));
            }
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    }

    useEffect(() => {
        if (firstLoad.current) {
            firstLoad.current = false;
            return;
        }

        const timeoutID = setTimeout(() => {
            saveTags();
        }, 1500);

        return () => clearTimeout(timeoutID);
    }, [selectedTags]);

    function saveTags() {
        if (selectedTags.length === 0) return;

        let data = {
            tags: selectedTags,
        };

        axios
            .put(route("edit.tags", image.id), data)
            .then((res) =>
                showNotification({
                    message: "Your edited tags were saved",
                    title: "Saved",
                }),
            )
            .catch((err) => {
                alert("Error happened! " + error);
                console.error(err);
            });
    }

    function deletePicture() {
        axios
            .delete(route("delete.picture", image.id))
            .then(() => {
                // nextImage();

                console.log("before", images);
                onDelete(image.id);
                showNotification({
                    title: "Deleted",
                    message: "Image was deleted successfully",
                    icon: <IconTrash size={20} strokeWidth={1.25} />,
                    color: "red",
                });
            })
            .catch((err) => {
                alert("Error appeared! " + err);
                console.error(err);
            });
    }

    // Function for searching blob link in cached variable
    function findBlobUrl(imgId) {
        // Check if url for half image hasn't been loaded yet and saved in cache
        // If has, then use the cached image blob link
        let url = route(hiddenImages ? "get.hidden.half.image" : "get.half.image", imgId);
        if (url in window.lazyLoadBlobs) {
            url = window.lazyLoadBlobs[url];
        }

        return url;
    }

    const SectionTitle = ({ text, icon, rightSection = <></> }) => (
        <div className={sty.section_title}>
            <div>
                {icon}
                <Text>{text}</Text>
            </div>
            {rightSection}
        </div>
    );

    function shareHandler() {
        axios
            .post(route("share.image.create"), { imageId: image.id })
            .then((res) => {
                showNotification({
                    message: res.data.message,
                    title: res.data.title,
                });

                if (res.data.public) {
                    setShared(true);
                    copyToClipboard(res.data.link, true, "Sharable link was copied to your clipboard", "Copied");
                } else {
                    setShared(false);
                }
            })
            .catch((err) => console.error(err));
    }

    function selectFromScroll(idx) {
        setSelected([images[idx].id, findBlobUrl(images[idx].id)]);
    }

    const iconProps = {
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <div className={sty.container} onClick={close}>
            <ConfirmationModal
                onClick={(e) => e.stopPropagation()}
                color={"red"}
                opened={confirmDelete}
                icon={<IconTrash />}
                onConfirm={deletePicture}
                title={"Delete picture?"}
                close={() => setConfirmDelete.close()}
                confirmBtnText="Delete"
            >
                Are you sure you want to delete this picture?
            </ConfirmationModal>

            <div className={sty.side} onClick={(e) => e.stopPropagation()}>
                <div>
                    <div className={sty.title}>
                        <Text test="image-name" size={"20px"} fw={600} className={`${sty.green_text}`}>
                            {image.name}
                        </Text>

                        <Menu zIndex={10000}>
                            <Menu.Target>
                                <ActionIcon variant="subtle">
                                    <IconDotsVertical />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                {shared ? (
                                    <>
                                        <Menu.Item leftSection={<IconShareOff {...iconProps} />} onClick={shareHandler}>
                                            <Text>Make private</Text>
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={<IconCopy {...iconProps} />}
                                            onClick={() =>
                                                copyToClipboard(
                                                    route("share.image.page", image.id),
                                                    true,
                                                    "Sharable link was copied to your clipboard",
                                                    "Copied",
                                                )
                                            }
                                        >
                                            <Text>Copy link</Text>
                                        </Menu.Item>
                                    </>
                                ) : (
                                    !hiddenImages && (
                                        <Menu.Item leftSection={<IconShare {...iconProps} />} onClick={shareHandler}>
                                            <Text>Make public</Text>
                                        </Menu.Item>
                                    )
                                )}
                                <Menu.Item
                                    onClick={() => window.open(route("download.image", image.id), "_blank")}
                                    leftSection={<IconDownload {...iconProps} />}
                                >
                                    <Text>Download</Text>
                                </Menu.Item>
                                <Menu.Item
                                    onClick={() => {
                                        setConfirmDelete.open();
                                    }}
                                    color={"red"}
                                    leftSection={<IconTrash {...iconProps} />}
                                >
                                    <Text>Delete</Text>
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>

                        <ActionIcon variant="subtle" onClick={() => close()}>
                            <IconX />
                        </ActionIcon>
                    </div>

                    <SectionTitle text={"File"} icon={<IconFileInfo />} />
                    <div className={sty.info_container}>
                        <Table>
                            <Table.Tbody>{fileInfoRows}</Table.Tbody>
                        </Table>
                    </div>

                    <SectionTitle text={"Tags"} icon={<IconTags />} />
                    <div className={sty.info_container}>
                        <Paper p={"0.5rem"} withBorder className={sty.checkboxes}>
                            {tags.map((tag, idx) => (
                                <Checkbox
                                    size="18px"
                                    key={idx}
                                    mt={idx === 0 ? 0 : 8}
                                    onChange={() => tagHandler(tag.id)}
                                    checked={selectedTags.includes(tag.id)}
                                    label={capitalizeFirstLetter(tag.name)}
                                />
                            ))}
                        </Paper>
                    </div>

                    {!hiddenImages && sub_tags_enabled && (
                        <>
                            <SectionTitle
                                text={"Found elements"}
                                icon={<IconRobot />}
                                rightSection={
                                    <Tooltip
                                        withArrow
                                        label="Found elements are sub-tags that were found using AI model, you can find these images by searching these tags"
                                        maw={300}
                                        multiline
                                        openDelay={1000}
                                    >
                                        <IconInfoHexagon {...iconProps} />
                                    </Tooltip>
                                }
                            />

                            <PictureViewerSubTags style={sty} sub_tags={image.sub_tags} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
