import { ActionIcon, Center, Menu, Pagination, Skeleton, Text } from "@mantine/core";
import {
    IconCheck,
    IconDotsVertical,
    IconPhotoOff,
    IconSelectAll,
    IconShare,
    IconTags,
    IconTagsOff,
    IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import "react-lazy-load-image-component/src/effects/blur.css";
import sty from "../../scss/Dashboard.module.scss";
import LazyLoadImage from "./Components/LazyLoadImage";
import PictureDivider from "./Components/PictureDivider";
import PictureViewer from "./Components/PictureViewer";
import Title from "./Components/Title";
import checkIfMobile from "./Functions/checkIfMobile";
import generateRandomBetween from "./Functions/randomNumberBetween";
import scrollUp from "./Functions/scrollUp";
import useElementSize from "./Functions/useElementSize";
import AuthLayout from "./Layouts/AuthLayout";

export default function Dashboard({ auth, title = "" }) {
    const [page, setPage] = useState(1);
    const [images, setImages] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Available tagas
    const [userTags, setUserTags] = useState([]);

    // queried tags
    const queryTags = useState([]);
    const firstRender = useRef(true);

    // Divide by months year etc
    const segmentControl = useState("month");

    // For multi select
    const [holding, setHolding] = useState([false, null]); // currently holding on image [if holding, image_id]
    const [multiSelect, setMultiSelect] = useState(null); // null -> no selected images [image_id] -> selected images

    const [containerSize, containerRef] = useElementSize();

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

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

    const skelets = Array(20).fill(null);

    function resetStates() {
        setImages(null);
    }

    useEffect(() => {
        imageSearch();
    }, [page]);

    useEffect(() => {
        if (firstRender.current) return;
        if (!images) return;
        segmentalSwitch();
    }, [segmentControl[0]]);

    function imageSearch() {
        resetStates();
        setProcessing(true);

        // get user tags
        axios.get(route("tags.get")).then((res) => setUserTags(res.data));

        axios
            .get(route("get.resized.images", page), {
                params: { queryTags: JSON.stringify(queryTags[0]) },
            })
            .then((res) => {
                segmentalSwitch(res.data.images); // Checks the switch, to see what images to display

                setTotalPages(res.data.totalPages);
                setProcessing(false);
                scrollUp({ timeout: false });
            });
    }

    function segmentalSwitch(allImages = null) {
        if (!allImages) {
            allImages = images.map((img) => img[1]).flat();
        }

        let arr = [];
        let months = [];

        switch (segmentControl[0]) {
            case "all":
                setImages([["All pictures", allImages]]);
                break;
            case "year":
                arr = [];
                allImages.forEach((img) => {
                    const year = new Date(img.uploaded).getFullYear();

                    // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                    let itemIndex = false;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i][0] === year) {
                            itemIndex = i;
                            break;
                        }
                    }

                    if (itemIndex !== false) {
                        arr[itemIndex][1].push(img);
                    } else {
                        arr.push([year, [img]]);
                    }
                });

                setImages(arr);
                break;
            case "month":
                arr = [];

                months = [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                ];

                allImages.forEach((img) => {
                    const d = new Date(img.uploaded);

                    // Get year and month variables
                    const year = d.getFullYear();

                    let month = months[d.getMonth()];

                    // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                    let itemIndex = false;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i][0] === `${month} ${year}`) {
                            itemIndex = i;
                            break;
                        }
                    }

                    if (itemIndex !== false) {
                        arr[itemIndex][1].push(img);
                    } else {
                        arr.push([`${month} ${year}`, [img]]);
                    }
                });

                setImages(arr);
                break;
            case "day":
                arr = [];

                months = [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ];

                allImages.forEach((img) => {
                    const d = new Date(img.uploaded);

                    // Get year and month variables
                    const year = d.getFullYear();
                    const month = months[d.getMonth()];
                    const day = d.getDate();

                    // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                    let itemIndex = false;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i][0] === `${month} ${day} ${year}`) {
                            itemIndex = i;
                            break;
                        }
                    }

                    if (itemIndex !== false) {
                        arr[itemIndex][1].push(img);
                    } else {
                        arr.push([`${month} ${day} ${year}`, [img]]);
                    }
                });

                setImages(arr);
                break;
        }
    }

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

    function onImageDelete(id) {
        // setSelectedImage(null);

        let newImages = [];
        images.forEach((imgArr) => {
            let rtn = [imgArr[0], imgArr[1].filter((image) => image.id !== id)];

            newImages.push(rtn);
        });

        setImages(newImages);
    }

    // --------------- Multi select functions --------------
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
        }, 1000);
        return () => clearTimeout(timeoutID);
    }, [holding]);

    // For testing purposes
    // useEffect(() => console.log(multiSelect), [multiSelect]);

    // sticky behaviour for multi select header
    const multiSelectRef = useRef(null);

    useEffect(() => {
        if (multiSelect === null) {
            return;
        }

        const scrollHandler = (e) => {
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
            queryTags={queryTags}
            segmentControl={segmentControl}
            userTags={userTags}
            auth={auth}
            page={page}
            setPage={setPage}
            maxPage={totalPages}
            className={selectedImage ? sty.no_scroll : ""}
        >
            <Title title={title} />
            {selectedImage && (
                <PictureViewer
                    close={() => setSelectedImage(null)}
                    onDelete={onImageDelete}
                    images={images.map((img) => img[1]).flat()}
                    selected={selectedImage}
                    setSelected={setSelectedImage}
                    tags={userTags}
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
                                <Menu.Item leftSection={<IconTags {...iconProps} />}>
                                    Add tags
                                </Menu.Item>
                                <Menu.Item leftSection={<IconTagsOff {...iconProps} />}>
                                    Remove tags
                                </Menu.Item>
                                <Menu.Item leftSection={<IconShare {...iconProps} />}>
                                    Share pictures
                                </Menu.Item>
                                <Menu.Item color="red" leftSection={<IconTrash {...iconProps} />}>
                                    Delete pictures
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </div>
                </div>
            )}

            {!images ? ( // getting a list of pictures to load
                <div className={`${sty.container}`}>
                    {skelets.map((x, i) => (
                        <Skeleton
                            key={i}
                            className={sty.column}
                            h={generateRandomBetween(100, 300)}
                        />
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
                                                    multiSelect !== null &&
                                                    multiSelect.includes(img.id)
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
                                                    src={route("get.half.image", img.id)}
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
