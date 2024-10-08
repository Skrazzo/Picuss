import React, { useEffect, useState } from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";
import axios from "axios";
import { IconDownload, IconDownloadOff, IconHash } from "@tabler/icons-react";
import capitalizeFirstLetter from "../../Functions/capitalizeFirstLetter";
import { ActionIcon, Pagination, Text, Tooltip } from "@mantine/core";
import LazyLoadImage from "../LazyLoadImage";
import scrollUp from "../../Functions/scrollUp";
import { PhotoProvider, PhotoView } from "react-photo-view";
import useElementSize from "../../Functions/useElementSize";

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
    const [viewingIndex, setViewingIndex] = useState(null);

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
        scrollUp({ timeout: false });
    }, [page]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 40,
    };

    return (
        <GuestLayout>
            <section id="top-section"></section>

            <div className="share-tag-header">
                <div className="info">
                    <div className="tag">
                        <IconHash {...iconProps} color="green" />
                        <div className="name">
                            <Text size={"28px"}>{capitalizeFirstLetter(data.info.tag_name)}</Text>
                            <Text c={"dimmed"}>Shared by {data.info.owner}</Text>
                        </div>
                    </div>

                    <ActionIcon ml={16} variant="transparent" disabled={!data.download.allowed}>
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
                                    onClick={() => window.open(route("share.tag.download", db_id), "_blank")}
                                />
                            ) : (
                                <IconDownloadOff {...iconProps} />
                            )}
                        </Tooltip>
                    </ActionIcon>
                </div>
            </div>

            <PhotoProvider
                onIndexChange={(e) => setViewingIndex(e)}
                toolbarRender={() => (
                    <IconDownload
                        strokeWidth={2}
                        size={20}
                        color="#BFBFBF"
                        onClick={() =>
                            window.open(route("share.download.image", data.pictures[viewingIndex].id), "_blank")
                        }
                    />
                )}
            >
                <div className="picture-main-container">
                    {data.pictures.map((pic, idx) => (
                        <PhotoView key={pic.id} src={route("share.tags.get.picture", pic.id)}>
                            <LazyLoadImage
                                id={pic.id}
                                src={route("share.get.half", pic.id)}
                                style={{ aspectRatio: `1/${pic.height / pic.width}` }}
                                thumbnail={pic.thumb}
                                rounded
                                onClick={() => setViewingIndex(idx)}
                                useLayoutId={true}
                            />
                        </PhotoView>
                    ))}
                </div>
            </PhotoProvider>
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
