import React, { useEffect, useState } from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";
import axios from "axios";
import { IconDownload, IconHash } from "@tabler/icons-react";
import capitalizeFirstLetter from "../../Functions/capitalizeFirstLetter";
import {
    ActionIcon,
    Container,
    Pagination,
    Text,
    Tooltip,
} from "@mantine/core";
import useElementSize from "../../Functions/useElementSize";
import LazyLoadImage from "../LazyLoadImage";
import { useDisclosure } from "@mantine/hooks";
import SinglePictureViewer from "./SinglePictureViewer";

export default function Index({ id }) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState({
        download: { allowed: false, size: 0.0 },
        maxPages: 1,
        pictureCount: 0,
        pictures: [],
        info: { owner: "unknown", tag_name: "unknown" },
    });
    const [processing, setProcessing] = useState(true);

    // For picture viewer
    const [selectedId, setSelectedId] = useState(null);

    const [containerSize, containerRef] = useElementSize();

    function getData() {
        axios
            .get(route("share.tags.api", [id, page]))
            .then((res) => {
                setData(res.data);
                setProcessing(false);
            })
            .catch((err) => console.error(err));
    }

    useEffect(() => {
        getData();
        const element = document.getElementById("top-section");
        if (element) {
            // 👇 Will scroll smoothly to the top of the next section
            element.scrollIntoView({ behavior: "smooth" });
        }
    }, [page]);

    useEffect(() => console.log(data), [data]);
    useEffect(() => console.log(selectedId), [selectedId]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 40,
    };

    return (
        <GuestLayout>
            <section id="top-section"></section>

            {selectedId && (
                <SinglePictureViewer
                    opened={selectedId === null ? false : true}
                    close={() => setSelectedId(null)}
                    pictures={data.pictures}
                    selected={selectedId}
                />
            )}

            <div className="share-tag-header">
                <div className="info">
                    <div className="tag">
                        <IconHash {...iconProps} color="green" />
                        <div className="name">
                            <Text size={"28px"}>
                                {capitalizeFirstLetter(data.info.tag_name)}
                            </Text>
                            <Text c={"dimmed"}>
                                Shared by {data.info.owner}
                            </Text>
                        </div>
                    </div>

                    <ActionIcon ml={16} variant="transparent">
                        <Tooltip withArrow label={"Download pictures"}>
                            <IconDownload {...iconProps} color="green" />
                        </Tooltip>
                    </ActionIcon>
                </div>
            </div>
            <div className="container">
                {data.pictures.map((pic) => (
                    <LazyLoadImage
                        key={pic.id}
                        id={pic.id}
                        src={route("share.get.half", pic.id)}
                        style={{ aspectRatio: `1/${pic.height / pic.width}` }}
                        thumbnail={pic.thumb}
                        rounded
                        onClick={(id, url) => setSelectedId([id, url])}
                    />
                ))}
            </div>

            <div className="center" ref={containerRef}>
                <Pagination
                    siblings={2}
                    disabled={processing}
                    value={page}
                    my={32}
                    total={data.maxPages}
                    onChange={setPage}
                    size={containerSize.width < 600 ? "sm" : "md"}
                />
            </div>
        </GuestLayout>
    );
}
