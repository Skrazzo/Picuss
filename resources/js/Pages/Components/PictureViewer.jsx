import React, { useEffect, useRef, useState } from "react";
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
    IconCopy,
    IconDeviceFloppy,
    IconDotsVertical,
    IconFileInfo,
    IconInfoCircleFilled,
    IconShare,
    IconShareOff,
    IconTags,
    IconTrash,
    IconX,
} from "@tabler/icons-react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";
import axios from "axios";
import showNotification from "../Functions/showNotification";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSwipeable } from "react-swipeable";
import ThumbnailScroll from "./ThumbnailScroll";
import useElementSize from "../Functions/useElementSize";
import { useDisclosure } from "@mantine/hooks";
import ConfirmationModal from "./ConfirmationModal";
import copyToClipboard from "../Functions/copyToClipboard";

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
    const [shared, setShared] = useState(image.shared);
    const [confirmDelete, setConfirmDelete] = useDisclosure(false);

    // use refs
    const [containerSize, containerRef] = useElementSize();
    const firstLoad = useRef(true);

    // console.log(image);
    // console.log(tags);
    // console.log(selectedTags);

    useEffect(() => {
        firstLoad.current = true; // set this to true, so selected tags useeffect does not refresh

        setShared(image.shared);
    }, [image]);

    const SectionTitle = ({ text, icon, rightSection = <></> }) => (
        <div className={sty.section_title}>
            <div>
                {icon}
                <Text>{text}</Text>
            </div>
            {rightSection}
        </div>
    );

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
                    message:
                        "Each image has to have at least one tag, that's why you cannot remove it.",
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
                })
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
                nextImage();
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

    function previousImage() {
        if (imageIndex === 0) {
            setSelected(null);
            return;
        }

        setSelected(images[imageIndex - 1].id);
    }

    function nextImage() {
        if (imageIndex === images.length - 1) {
            setTimeout(() => {
                const element = document.getElementById("bottom-section");
                if (element) {
                    // 👇 Will scroll smoothly to the top of the next section
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 500);
            setSelected(null);
            return;
        }

        setSelected(images[imageIndex + 1].id);
    }

    const swipeHandlers = useSwipeable({
        onSwipedLeft: () => nextImage(),
        onSwipedRight: () => previousImage(),
        onSwipedDown: () => close(),
    });

    // register keyboard shortcuts
    const handleKeyDown = (event) => {
        switch (event.key) {
            case "ArrowLeft":
                previousImage();
                break;
            case "ArrowRight":
                nextImage();
                break;
            case "Escape":
                setSelected(null);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        setSelectedTags(image.tags);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [imageIndex]);

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
                    copyToClipboard(
                        res.data.link,
                        true,
                        "Sharable link was copied to your clipboard",
                        "Copied"
                    );
                } else {
                    setShared(false);
                }
            })
            .catch((err) => console.error(err));
    }

    const iconProps = {
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <div className={sty.container}>
            <ConfirmationModal
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
                                {shared ? (
                                    <>
                                        <Menu.Item
                                            leftSection={
                                                <IconShareOff {...iconProps} />
                                            }
                                            onClick={shareHandler}
                                        >
                                            <Text>Make private</Text>
                                        </Menu.Item>
                                        <Menu.Item
                                            leftSection={
                                                <IconCopy {...iconProps} />
                                            }
                                            onClick={() =>
                                                copyToClipboard(
                                                    route(
                                                        "share.image.page",
                                                        image.id
                                                    ),
                                                    true,
                                                    "Sharable link was copied to your clipboard",
                                                    "Copied"
                                                )
                                            }
                                        >
                                            <Text>Copy link</Text>
                                        </Menu.Item>
                                    </>
                                ) : (
                                    <Menu.Item
                                        leftSection={
                                            <IconShare {...iconProps} />
                                        }
                                        onClick={shareHandler}
                                    >
                                        <Text>Make public</Text>
                                    </Menu.Item>
                                )}
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
                        // rightSection={
                        //     <ActionIcon variant="subtle">
                        //         {selectedTags.length === 0 ? (
                        //             <IconBan />
                        //         ) : (
                        //             <IconDeviceFloppy onClick={saveTags} />
                        //         )}
                        //     </ActionIcon>
                        // }
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
                                    checked={selectedTags.includes(tag.id)}
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

            <div className={sty.picture_container} ref={containerRef}>
                <ActionIcon
                    onClick={close}
                    variant="light"
                    className={sty.closeBtn}
                >
                    <IconX />
                </ActionIcon>

                <div onClick={close} className={sty.picture} {...swipeHandlers}>
                    <LazyLoadImage
                        placeholderSrc={route("get.half.image", image.id)}
                        src={route("get.image", image.id)}
                        effect="blur"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        style={{ aspectRatio: image.aspectRatio }}
                    />
                </div>

                <ThumbnailScroll
                    images={images}
                    currentIndex={imageIndex}
                    onClick={(idx) => setSelected(images[idx].id)}
                    pictureContainerSize={containerSize}
                />
            </div>
        </div>
    );
}
