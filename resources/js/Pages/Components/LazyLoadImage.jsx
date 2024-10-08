import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import errorNotification from "../Functions/errorNotification";
import { motion } from "framer-motion";

const LazyLoadImage = React.memo(
    ({
        id,
        thumbnail,
        src,
        alt = "Image",
        style = {},
        containerStyle = {},
        className = "",
        rounded = false,
        blur = true,
        onClick = (id, image) => console.log(`Clicked on ${id} - ${image}`),
        useLayoutId = true,
        setLoading = () => {},
        animation = false,
    }) => {
        // useStates
        const [image, setImage] = useState(null);

        useEffect(() => {
            // Checking if image has already been downloaded
            if (typeof window.lazyLoadBlobs === "object") {
                if (src in window.lazyLoadBlobs) {
                    setImage(window.lazyLoadBlobs[src]);
                    setLoading(false);
                    return;
                }
            }

            // Controller for axios request
            const controller = new AbortController();

            setLoading(true);
            axios
                .get(src, { responseType: "blob", signal: controller.signal })
                .then((res) => {
                    const url = URL.createObjectURL(res.data);

                    // Caching
                    if (typeof window.lazyLoadBlobs === "undefined") {
                        window.lazyLoadBlobs = {
                            [src]: url,
                        };
                    } else if (typeof window.lazyLoadBlobs === "object") {
                        window.lazyLoadBlobs = {
                            ...window.lazyLoadBlobs,
                            [src]: url,
                        };
                    }

                    setLoading(false);
                    setImage(url);
                })
                .catch((err) => {
                    if (err.code !== "ERR_CANCELED") {
                        errorNotification(err);
                    }
                });

            return () => {
                // Discard previous image, and display thumbnail instead
                setImage(null);
                setLoading(false);

                // Cancel previous axios request
                controller.abort();
            };
        }, [src]);

        // Use effect to prevent dragging on all .no-drag images
        useEffect(() => {
            // Add event listener to all images, that prevents dragging
            const preventDrag = (e) => {
                console.log("asd");
                e.preventDefault();
            };
            const images = document.querySelectorAll(".no-drag");

            images.forEach((image) => {
                image.addEventListener("dragstart", preventDrag);
            });

            return () => {
                images.forEach((image) => {
                    image.removeEventListener("dragstart", preventDrag);
                });
            };
        }, []);

        // useEffect(() => console.log(image), [image]);

        return (
            <motion.div
                layoutId={useLayoutId ? id : null}
                style={containerStyle}
                className={`lazy-load-image${blur ? (image ? "" : "-blur") : ""} ${className}`}
                onClick={() => onClick(id, image)}
            >
                <img className="no-drag" style={style} src={image ? image : thumbnail} alt={alt} />
            </motion.div>
        );
    },
);

export default LazyLoadImage;
