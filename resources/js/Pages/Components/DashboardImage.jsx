import { Paper } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import sty from "../../../scss/Dashboard.module.scss";

export default function DashboardImage({ image }) {
    const picussVarName = "picuss-image-cache";
    const [blob, setBlob] = useState(null);
    const imageQueue = 6; // allowed downloading images at the same time

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    useEffect(() => {
        let isActive = true;
        const loadImage = async () => {
            if (!window.imageQueue) window.imageQueue = [];

            while (window.imageQueue.length >= imageQueue) {
                await sleep(1000);
                console.log("sleeping");
            }

            // after loop is exited, whe need to check if the page is still active
            if (!isActive) return;

            window.imageQueue.push(1);

            axios
                .get(route("get.image", image.id), {
                    responseType: "blob",
                })
                .then((res) => {
                    const imageURL = URL.createObjectURL(res.data);
                    setBlob(imageURL);
                    window.imageQueue.pop();
                })
                .catch((err) => console.error(err));
        };

        loadImage();

        return () => {
            isActive = false;
            window.imageQueue = [];
        };
    }, []);

    return (
        <Paper withBorder className={`${sty.column} `}>
            <img
                src={blob ? blob : image.thumb}
                alt="Image loading..."
                className={`${!blob ? sty.blur : ""}`}
            />
        </Paper>
    );
}
