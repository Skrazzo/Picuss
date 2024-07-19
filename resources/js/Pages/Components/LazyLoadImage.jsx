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
        className = "",
        rounded = false,
        blur = true,
        onClick = (id, image) => console.log(`Clicked on ${id} - ${image}`),
        useLayoutId = true,
    }) => {
        // useStates
        const [image, setImage] = useState(null);

        useEffect(() => {
            // Checking if image has already been downloaded
            if (typeof window.lazyLoadBlobs === "object") {
                if (src in window.lazyLoadBlobs) {
                    setImage(window.lazyLoadBlobs[src]);
                    return;
                }
            }

            // Controller for axios request
            const controller = new AbortController();

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

                // Cancel previous axios request
                controller.abort();
            };
        }, [src]);

        // useEffect(() => console.log(image), [image]);

        return (
            <motion.div
                layoutId={useLayoutId ? id : null}
                className={`lazy-load-image${blur ? (image ? "" : "-blur") : ""} ${className}`}
                style={{ borderRadius: rounded ? "0.25rem" : 0 }}
                onClick={() => onClick(id, image)}
            >
                <img style={style} src={image ? image : thumbnail} alt={alt} />
            </motion.div>
        );
    },
);

export default LazyLoadImage;
