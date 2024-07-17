import React, { memo, useEffect, useRef, useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import sty from "../../scss/Dashboard.module.scss";
import generateRandomBetween from "./Functions/randomNumberBetween";
import { AspectRatio, Center, Pagination, Skeleton, Text } from "@mantine/core";
import axios from "axios";
import "react-lazy-load-image-component/src/effects/blur.css";
import { IconPhotoOff } from "@tabler/icons-react";
import PictureViewer from "./Components/PictureViewer";
import PictureDivider from "./Components/PictureDivider";
import useElementSize from "./Functions/useElementSize";
import LazyLoadImageComponent from "./Components/LazyLoadImageComponent";
import Title from "./Components/Title";
import LazyLoadImage from "./Components/LazyLoadImage";

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
                    Looks like you’re so stunning that even the internet
                    couldn’t handle your photos
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

    return (
        <AuthLayout
            queryTags={queryTags}
            segmentControl={segmentControl}
            userTags={userTags}
            auth={auth}
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
                                                className={sty.picture}
                                                key={i}
                                            >
                                                <LazyLoadImage
                                                    thumbnail={img.thumb}
                                                    id={img.id}
                                                    src={route(
                                                        "get.half.image",
                                                        img.id
                                                    )}
                                                    onClick={(id, thumb) =>
                                                        setSelectedImage([
                                                            id,
                                                            thumb,
                                                        ])
                                                    }
                                                    style={{
                                                        aspectRatio:
                                                            img.aspectRatio,
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
