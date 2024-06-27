import React from "react";
import sty from "../../../scss/PictureViewer.module.scss";

export default function PictureViewer({ selected, setSelected, images }) {
    if (!selected) return <></>;
    return <div className={sty.container}>PictureViewer</div>;
}
