import React, { useEffect, useState } from "react";
import sty from "../../../scss/ThumbnailScroll.module.scss";
import { motion } from "framer-motion";

export default function ThumbnailScroll({
    images,
    currentIndex,
    onClick,
    pictureContainerSize,
}) {
    /*
        We are taking half of the picture container width
        them half of the thumbnail width (45px) and then multiplying by current selected picture and adding 1
        then taking current index and multiplying it with gap

    */

    const [offset, setOffset] = useState(0);

    useEffect(() => {
        let thumbnailOffset =
            pictureContainerSize.width / 2 -
            45 * currentIndex -
            22.5 -
            4 * currentIndex;

        console.log(
            `width: ${pictureContainerSize.width} index: ${currentIndex}`
        );
        setOffset(thumbnailOffset);
    }, [currentIndex, pictureContainerSize.width]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={sty.container}
        >
            <motion.div
                animate={{ x: offset }}
                style={{ display: "flex", gap: "0.25rem" }}
            >
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        onClick={() => onClick(idx)}
                        className={sty.thumbnail}
                        style={{
                            aspectRatio: idx === currentIndex ? "1/1" : "",
                            transition: "250ms",
                        }}
                    >
                        <img src={img.thumb} />
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}
