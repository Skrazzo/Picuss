import axios from "axios";
import React, { useEffect, useState } from "react";
import errorNotification from "../Functions/errorNotification";

const LazyLoadImage = React.memo(
    ({
        thumbnail,
        src,
        alt = "Image",
        style = {},
        className = "",
        rounded = false,
        onClick = () => console.log("Clicked"),
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

        useEffect(() => console.log(image), [image]);

        return (
            <div
                className={`lazy-load-image${
                    image ? "" : "-blur"
                } ${className}`}
                style={{ borderRadius: rounded ? "0.25rem" : 0 }}
                onClick={onClick}
            >
                <img style={style} src={image ? image : thumbnail} alt={alt} />
            </div>
        );
    }
);

export default LazyLoadImage;
