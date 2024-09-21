import PinAuthenticate from "./Components/Hidden/PinAuthenticate";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { Skeleton, Text } from "@mantine/core";
import sty from "../../scss/Dashboard.module.scss";
import { IconCheck, IconPhotoOff } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";
import PictureDivider from "./Components/PictureDivider";
import LazyLoadImage from "./Components/LazyLoadImage";
import generateRandomBetween from "./Functions/randomNumberBetween";
import segmentalSwitch from "./Functions/segmentalSwitch";

export default function Hidden({ allowed, title, auth, hasPin }) {
    const [images, setImages] = useState(null);

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

    function searchImages() {
        axios.get(route("get.hidden.resized.images", 1)).then((res) => {
            // Checks the switch, to see what images to display
            // Segmental switch fuction, splits images into segmental arrays based on the segment control
            setImages(segmentalSwitch(res.data.images, images, segmentControl));
        });
    }

    useEffect(() => {
        searchImages();
    }, []);

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

    return (
        <AuthLayout auth={auth} segmentControl={segmentControl}>
            <Title title={title} />
            {!allowed && (
                <PinAuthenticate opened={true} title="" closeButton={false} firstTime={!hasPin} />
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
                                                    // src={route("get.half.image", img.id)}
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
        </AuthLayout>
    );
}
