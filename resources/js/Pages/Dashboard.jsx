import React, { useEffect, useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import sty from "../../scss/Dashboard.module.scss";
import { LazyLoadImage } from "react-lazy-load-image-component";
import generateRandomBetween from "./Functions/randomNumberBetween";
import { Center, Pagination, Skeleton, Text } from "@mantine/core";
import axios from "axios";
import "react-lazy-load-image-component/src/effects/blur.css";
import { IconPhotoOff } from "@tabler/icons-react";
import PictureViewer from "./Components/PictureViewer";

export default function Dashboard({ auth }) {
    const [page, setPage] = useState(1);
    const [images, setImages] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    // Available tagas
    const [userTags, setUserTags] = useState([]);

    // queried tags
    const queryTags = useState([]);
    useEffect(() => {
        // Wait for 2 seconds for tags to finish changing
        const timeoutID = setTimeout(() => {
            imageSearch();
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
                setImages(res.data.images);
                setTotalPages(res.data.totalPages);
                setProcessing(false);
            });
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
        setSelectedImage(null);
        setImages(images.filter((image) => image.id !== id));
    }

    return (
        <AuthLayout
            queryTags={queryTags}
            userTags={userTags}
            auth={auth}
            className={selectedImage ? sty.no_scroll : ""}
        >
            {selectedImage && (
                <PictureViewer
                    close={() => setSelectedImage(null)}
                    onDelete={onImageDelete}
                    images={images}
                    selected={selectedImage}
                    setSelected={setSelectedImage}
                    tags={userTags}
                />
            )}
            <div className={`${sty.container}`}>
                {!images ? ( // getting a list of pictures to load
                    <>
                        {skelets.map((x, i) => (
                            <Skeleton
                                key={i}
                                className={sty.column}
                                h={generateRandomBetween(100, 300)}
                            />
                        ))}
                    </>
                ) : (
                    <>
                        {images.length === 0 ? (
                            noPicturesFound // Displaying no pictures found message
                        ) : (
                            <>
                                {images.map(
                                    (
                                        img,
                                        i // Loading actual pictures
                                    ) => (
                                        <div className={sty.overflow_hidden}>
                                            <LazyLoadImage
                                                key={i}
                                                placeholderSrc={img.thumb}
                                                src={route("get.image", img.id)}
                                                effect="blur"
                                                onClick={() =>
                                                    setSelectedImage(img.id)
                                                }
                                            />
                                        </div>
                                    )
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            <Center>
                <Pagination
                    disabled={processing}
                    mx={"auto"}
                    my={32}
                    total={totalPages}
                    withEdges
                    onChange={setPage}
                />
            </Center>
        </AuthLayout>
    );
}
