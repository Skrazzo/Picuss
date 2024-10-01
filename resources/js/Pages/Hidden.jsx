import PinAuthenticate from "./Components/Hidden/PinAuthenticate";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { ActionIcon, Center, Menu, Modal, Pagination, Skeleton, Text } from "@mantine/core";
import sty from "../../scss/Dashboard.module.scss";
import {
    IconCheck,
    IconDotsVertical,
    IconDownload,
    IconEye,
    IconEyeOff,
    IconPhotoOff,
    IconSelectAll,
    IconTags,
    IconTagsOff,
    IconTrash,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import PictureDivider from "./Components/PictureDivider";
import LazyLoadImage from "./Components/LazyLoadImage";
import generateRandomBetween from "./Functions/randomNumberBetween";
import segmentalSwitch from "./Functions/segmentalSwitch";
import checkIfMobile from "./Functions/checkIfMobile";
import PictureViewer from "./Components/PictureViewer";
import scrollUp from "./Functions/scrollUp";
import useElementSize from "./Functions/useElementSize";
import AddTags from "./Components/MultiSelect/AddTags";
import RemoveTags from "./Components/MultiSelect/RemoveTags";
import ConfirmationModal from "./Components/ConfirmationModal";
import errorNotification from "./Functions/errorNotification";

export default function Hidden({ allowed, title, auth, hasPin }) {
    const [openedPinModal, setOpenedPinModal] = useState(!allowed);
    const firstRender = useRef(true);
    const [images, setImages] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [processing, setProcessing] = useState(false);
    const [containerSize, containerRef] = useElementSize();

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const queryTags = useState([]);

    // Available tagas
    const [userTags, setUserTags] = useState([]);

    // Divide by months year etc
    // [0] -> value [1] -> set value
    const segmentControl = useState("month");

    const skelets = Array(30).fill(null);

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

    /**
     * Deletes an image with id from the images list.
     * @param {number} id - The id of the image to delete
     * @returns {void}
     */
    function onImageDelete(id) {
        // setSelectedImage(null);

        let newImages = [];
        images.forEach((imgArr) => {
            let rtn = [imgArr[0], imgArr[1].filter((image) => image.id !== id)];

            newImages.push(rtn);
        });

        setImages(newImages);
    }

    function resetStates() {
        setImages(null);
    }

    function imageSearch() {
        resetStates();
        setProcessing(true);

        axios
            .get(route("get.hidden.resized.images", page), { params: { queryTags: JSON.stringify(queryTags[0]) } })
            .then((res) => {
                // Checks the switch, to see what images to display
                // Segmental switch fuction, splits images into segmental arrays based on the segment control
                setImages(segmentalSwitch(res.data.images, images, segmentControl));

                setTotalPages(res.data.totalPages);
                setProcessing(false);
                scrollUp({ timeout: false });
            });

        // get user tags
        axios.get(route("hidden.get.tags")).then((res) => setUserTags(res.data));
    }

    useEffect(() => {
        if (firstRender.current) return;
        if (!images) return;
        // Segmental switch fuction, splits images into segmental arrays based on the segment control
        // Recalculate items
        setImages(segmentalSwitch(null, images, segmentControl));
    }, [segmentControl[0]]);

    useEffect(() => {
        if (firstRender.current) return;

        // Wait for 2 seconds for tags to finish changing
        const timeoutID = setTimeout(() => {
            if (page !== 1) {
                setPage(1);
            } else {
                imageSearch();
            }
        }, 2000);
        return () => clearTimeout(timeoutID);
    }, [queryTags[0]]);

    // This function has to be at the end of useStates, because it sets first render as false
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        }

        if (!openedPinModal) {
            imageSearch();
        }
    }, [page]);

    //#region Multi select
    // --------------- Multi select functions --------------

    // For multi select
    const [multiSelect, setMultiSelect] = useState(null); // null -> no selected images [image_id] -> selected images
    const [holding, setHolding] = useState([false, null]); // currently holding on image [if holding, image_id]

    // id -> picture_id
    function onPcEnter(id) {
        if (checkIfMobile()) return;
        if (multiSelect !== null) return; // If already in selection mode
        setHolding([true, id]);
    }

    function onPcLeave() {
        if (checkIfMobile()) return;
        if (multiSelect !== null) return; // If already in selection mode
        setHolding([false, null]);
    }

    function onMobileEnter(id) {
        if (!checkIfMobile()) return;
        if (multiSelect !== null) return; // If already in selection mode
        setHolding([true, id]);
    }

    function onMobileLeave() {
        if (!checkIfMobile()) return;
        if (multiSelect !== null) return; // If already in selection mode
        setHolding([false, null]);
    }

    function onSelectHandler(id) {
        if (multiSelect.includes(id)) {
            if (multiSelect.length === 1) {
                // cancel multiple select, when last one was deselected
                selectCancel();
            } else {
                // Remove one selecteed image from selected array
                setMultiSelect([...multiSelect.filter((x) => x !== id)]);
            }
        } else {
            setMultiSelect([...multiSelect, id]);
        }
    }

    function selectCancel() {
        setMultiSelect(null);
    }

    /*
        Use effect for detecting that image was held for a second long press
        holding useState array [
            true or false, -> holding or not
            image.id
        ]
    */
    useEffect(() => {
        const timeoutID = setTimeout(() => {
            if (holding[0]) {
                // User pressed and held image for 500ms
                // Enter multi select mode

                // TODO: Remoove console log
                console.log("Entering select mode ", holding[1]);

                if (!checkIfMobile()) {
                    // We are creating empty array, because when pc clicks, it will add the image into the select array
                    setMultiSelect([]);
                } else {
                    // But when on phone, after holding an image, it does not trigger onClick function
                    // Thats why we are adding image id to the array
                    setMultiSelect([holding[1]]);
                }
                setHolding([false, null]);
            }
        }, 750);
        return () => clearTimeout(timeoutID);
    }, [holding]);

    // TODO: Remove useEffect that were created for testing purposes
    // For testing purposes
    // useEffect(() => console.log(multiSelect), [multiSelect]);

    // sticky behaviour for multi select header
    const multiSelectRef = useRef(null);

    useEffect(() => {
        if (multiSelect === null) {
            return;
        }

        const scrollHandler = (e) => {
            // TODO: Remove console log
            const fixedClassName = "fixed-position";

            if (e.target.scrollTop >= e.target.querySelector("nav").offsetHeight) {
                if (!multiSelectRef.current.classList.contains(fixedClassName)) {
                    multiSelectRef.current.classList.add(fixedClassName);
                    console.log("class added");
                }
            } else {
                if (multiSelectRef.current.classList.contains(fixedClassName)) {
                    multiSelectRef.current.classList.remove(fixedClassName);
                    console.log("class removed");
                }
            }
        };

        // auth container, is the main container for all content, needed to create sticky behaviour for nav bar
        const authContainer = document.getElementById("auth-container");
        authContainer.addEventListener("scroll", scrollHandler);

        // Removes the listener whenever the multiselect value changes
        return () => {
            authContainer.removeEventListener("scroll", scrollHandler);
        };
    }, [multiSelect]);

    function selectAll() {
        const allImages = images.map((img) => img[1]).flat();
        let allImageId = allImages.map((x) => x.id);

        // We need to filter images out, so there are no dublicates in the array
        let filteredIds = allImageId.filter((id) => !multiSelect.includes(id));

        if (filteredIds.length === 0) {
            // All images have been selected, now we need to deselect them
            setMultiSelect([...multiSelect.filter((id) => !allImageId.includes(id))]);
        } else {
            setMultiSelect([...multiSelect, ...filteredIds]);
        }
    }

    // --------------- Multi select end functions ----------
    //#endregion

    //#region Multi select functions
    // --------------- Multi select menu functions ---------

    const [addTagsConfirm, setAddTagsConfirm] = useState(false);
    const [removeTagsConfirm, setRemoveTagsConfirm] = useState(false);
    const [deleteImagesConfirm, setDeleteImagesConfirm] = useState(false);
    const [revealModal, setRevealModal] = useState(false);

    function onMultiDeleteConfirm() {
        axios
            .delete(route("delete.pictures"), { params: { pictures: multiSelect } })
            .then((res) => {
                setMultiSelect(null);
                imageSearch();
            })
            .catch((err) => errorNotification(err));
    }

    function revealPicturesHandler() {
        setRevealModal(false);

        axios
            .post(route("reveal.pictures"), { pictures: multiSelect })
            .then((res) => {
                imageSearch();
                setMultiSelect(null);
            })
            .catch((err) => errorNotification(err));
    }

    // ----------- Multi select menu functions end ---------
    //#endregion

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
    };

    const multiSelectIcons = {
        ...iconProps,
        size: 24,
    };

    return (
        <AuthLayout
            auth={auth}
            segmentControl={segmentControl}
            queryTags={queryTags}
            userTags={userTags}
            page={page}
            setPage={setPage}
            maxPage={totalPages}
        >
            <Title title={title} />

            <PinAuthenticate
                opened={openedPinModal}
                title=""
                onSuccessAuth={() => {
                    setOpenedPinModal(false);
                    imageSearch();
                }}
                closeButton={false}
                firstTime={!hasPin}
            />

            <ConfirmationModal
                icon={<IconEye />}
                opened={revealModal}
                title={"Reveal pictures"}
                close={() => setRevealModal(false)}
                onConfirm={revealPicturesHandler}
                color={"green"}
            >
                Are you sure you want to reveal the selected pictures?
            </ConfirmationModal>

            <Modal opened={addTagsConfirm} title={"Add tags to the pictures"} onClose={() => setAddTagsConfirm(false)}>
                {/* ==== Add tags ==== */}
                <AddTags
                    selectedPictures={multiSelect}
                    onUpdateGallery={imageSearch}
                    onClose={() => {
                        setAddTagsConfirm(false);
                        setMultiSelect(null);
                    }}
                />
            </Modal>

            <ConfirmationModal
                opened={deleteImagesConfirm}
                title={`Delete pictures`}
                color={"red"}
                icon={<IconTrash />}
                close={() => setDeleteImagesConfirm(false)}
                onConfirm={onMultiDeleteConfirm}
            >
                Are you sure you want to delete{" "}
                <b className="important-span-danger">{multiSelect === null ? 0 : multiSelect.length}</b> pictures from
                your gallery
            </ConfirmationModal>

            <Modal
                opened={removeTagsConfirm}
                title={"Remove tags from pictures"}
                onClose={() => setRemoveTagsConfirm(false)}
            >
                {/* ==== Remove tags ==== */}
                <RemoveTags
                    selectedPictures={multiSelect}
                    onUpdateGallery={imageSearch}
                    onClose={() => {
                        setRemoveTagsConfirm(false);
                        setMultiSelect(null);
                    }}
                />
            </Modal>

            {selectedImage && (
                <PictureViewer
                    close={() => setSelectedImage(null)}
                    onDelete={onImageDelete}
                    images={images.map((img) => img[1]).flat()}
                    selected={selectedImage}
                    setSelected={setSelectedImage}
                    tags={userTags}
                    hiddenImages
                />
            )}

            {multiSelect !== null && (
                <div className={sty.multiSelect_nav} ref={multiSelectRef}>
                    <Text fs={"italic"} c={"dimmed"}>
                        <span className="important-span">{multiSelect.length}</span>{" "}
                        {multiSelect.length === 1 ? "Picture" : "Pictures"} are selected
                    </Text>

                    <div className={sty.actions}>
                        <ActionIcon variant="light" size={"lg"} onClick={selectAll}>
                            <IconSelectAll {...multiSelectIcons} />
                        </ActionIcon>

                        <Menu>
                            <Menu.Target>
                                <ActionIcon variant="light" size={"lg"}>
                                    <IconDotsVertical {...multiSelectIcons} />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label>Picture actions</Menu.Label>
                                <Menu.Item
                                    leftSection={<IconTags {...iconProps} />}
                                    onClick={() => setAddTagsConfirm(true)}
                                >
                                    Add tags
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconTagsOff {...iconProps} />}
                                    onClick={() => setRemoveTagsConfirm(true)}
                                >
                                    Remove tags
                                </Menu.Item>

                                <Menu.Item
                                    leftSection={<IconDownload {...iconProps} />}
                                    onClick={() =>
                                        window.open(
                                            route("download.multiple.hidden.images", JSON.stringify(multiSelect)),
                                            "_blank",
                                        )
                                    }
                                >
                                    Download
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconEye {...iconProps} />}
                                    onClick={() => setRevealModal(true)}
                                >
                                    Reveal
                                </Menu.Item>
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash {...iconProps} />}
                                    onClick={() => setDeleteImagesConfirm(true)}
                                >
                                    Delete
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                </div>
            )}

            {!images ? ( // getting a list of pictures to load
                <div className={`${sty.container}`}>
                    {skelets.map((x, i) => (
                        <Skeleton key={i} className={sty.column} h={generateRandomBetween(100, 300)} />
                    ))}
                </div>
            ) : images.length === 0 ? ( // Couldnt find any pictures in segments
                noPicturesFound
            ) : (
                images.map((segment, idx) => {
                    let segImages = segment[1];
                    return (
                        <>
                            <PictureDivider title={segment[0]} />
                            <div className={`${sty.container}`}>
                                <>
                                    {segImages.map((img, i) => {
                                        return (
                                            <div
                                                className={
                                                    multiSelect !== null && multiSelect.includes(img.id)
                                                        ? sty.picture_selected
                                                        : sty.picture
                                                }
                                                key={i}
                                                onMouseDown={() => onPcEnter(img.id)}
                                                onMouseUp={() => onPcLeave()}
                                                onTouchStart={() => onMobileEnter(img.id)}
                                                onTouchEnd={() => onMobileLeave()}
                                            >
                                                {img.height > 100 && (
                                                    <div className={sty.picture_check}>
                                                        <IconCheck size={20} />
                                                    </div>
                                                )}
                                                <LazyLoadImage
                                                    thumbnail={img.thumb}
                                                    id={img.id}
                                                    src={route("get.hidden.half.image", img.id)}
                                                    onClick={(id, thumb) =>
                                                        multiSelect !== null
                                                            ? onSelectHandler(id)
                                                            : setSelectedImage([id, thumb])
                                                    }
                                                    style={{
                                                        aspectRatio: img.aspectRatio,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </>
                            </div>
                        </>
                    );
                })
            )}

            <Center ref={containerRef}>
                <Pagination
                    siblings={containerSize.width < 600 ? 1 : 3}
                    disabled={processing}
                    value={page}
                    mx={"auto"}
                    my={32}
                    total={totalPages}
                    onChange={setPage}
                    size={containerSize.width < 600 ? "sm" : "md"}
                />
            </Center>
            <section id="bottom-section"></section>
        </AuthLayout>
    );
}
