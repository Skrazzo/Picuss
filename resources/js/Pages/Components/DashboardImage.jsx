import { Paper } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import sty from "../../../scss/Dashboard.module.scss";

export default function DashboardImage({ image }) {
    const [blob, setBlob] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        axios
            .get(route("get.image", image.id), {
                signal: controller.signal,
                responseType: "blob",
            })
            .then((res) => {
                const imageURL = URL.createObjectURL(res.data);
                setBlob(imageURL);
            })
            .catch((err) => console.error(err));

        return () => {
            controller.abort();
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
