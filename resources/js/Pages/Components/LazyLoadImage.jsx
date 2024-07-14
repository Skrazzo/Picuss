import axios from "axios";
import React, { useEffect, useState } from "react";
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
    }) => {
        const [image, setImage] = useState(null);

        useEffect(() => {
            axios
                .get(src, { responseType: "blob" })
                .then((res) => {
                    setImage(URL.createObjectURL(res.data));
                })
                .catch((err) => errorNotification(err));
        }, []);

        // useEffect(() => console.log(image), [image]);

        return (
            <motion.div
                layoutId={id}
                className={`lazy-load-image${
                    blur ? (image ? "" : "-blur") : ""
                } ${className}`}
                style={{ borderRadius: rounded ? "0.25rem" : 0 }}
                onClick={() => onClick(id, image)}
            >
                <img style={style} src={image ? image : thumbnail} alt={alt} />
            </motion.div>
        );
    }
);

export default LazyLoadImage;
