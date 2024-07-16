import React, { useEffect, useState } from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";
import axios from "axios";
import { IconDownload, IconDownloadOff, IconHash } from "@tabler/icons-react";
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

export default function Index({ id, db_id }) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState({
        download: { allowed: false, size: 0.0, limit: 0 },
        maxPages: 1,
        pictureCount: 0,
        pictures: [],
        info: { owner: "unknown", tag_name: "unknown" },
    });
    const [processing, setProcessing] = useState(true);

    // For picture viewer
    const [selectedId, setSelectedId] = useState(null);
    const [onTopId, setOnTopId] = useState(null);

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

    // So images do not render under other images
    useEffect(() => {
        if (!selectedId) return;
        setOnTopId(selectedId[0]);
    }, [selectedId]);

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

                    <ActionIcon
                        ml={16}
                        variant="transparent"
                        disabled={!data.download.allowed}
                    >
                        <Tooltip
                            withArrow
                            label={
                                data.download.allowed
                                    ? "Download pictures"
                                    : `Download is not allowed, becuase zip file exceeds server limit of ${data.download.limit} MB`
                            }
                        >
                            {data.download.allowed ? (
                                <IconDownload
                                    {...iconProps}
                                    color="green"
                                    onClick={() =>
                                        window.open(
                                            route("share.tag.download", db_id),
                                            "_blank"
                                        )
                                    }
                                />
                            ) : (
                                <IconDownloadOff {...iconProps} />
                            )}
                        </Tooltip>
                    </ActionIcon>
                </div>
            </div>
            <div className="picture-main-container">
                {data.pictures.map((pic) => (
                    <LazyLoadImage
                        key={pic.id}
                        id={pic.id}
                        src={route("share.get.half", pic.id)}
                        style={{ aspectRatio: `1/${pic.height / pic.width}` }}
                        thumbnail={pic.thumb}
                        rounded
                        onClick={(id, url) => setSelectedId([id, url])}
                        className={onTopId === pic.id ? "onTop" : ""}
                    />
                ))}
            </div>

            <div className="center" ref={containerRef}>
                <Pagination
                    siblings={containerSize.width < 600 ? 1 : 3}
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
