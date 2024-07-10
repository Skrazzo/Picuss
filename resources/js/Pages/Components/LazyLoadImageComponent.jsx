import React, { memo } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

const LazyLoadImageComponent = memo(function LazyLoadImageComponent({
    img,
    setSelectedImage,
}) {
    console.log("redraw");

    return (
        <div style={{ borderRadius: "0.25rem", overflow: "hidden" }}>
            <LazyLoadImage
                placeholderSrc={img.thumb}
                src={route("get.half.image", img.id)}
                effect="blur"
                onClick={() => setSelectedImage(img.id)}
            />
        </div>
    );
});

export default LazyLoadImageComponent;
