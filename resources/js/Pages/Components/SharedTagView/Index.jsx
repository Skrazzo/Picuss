import React, { useEffect, useState } from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";
import axios from "axios";
import { IconDownload, IconHash } from "@tabler/icons-react";
import capitalizeFirstLetter from "../../Functions/capitalizeFirstLetter";
import { ActionIcon, Text, Tooltip } from "@mantine/core";

export default function Index({ id }) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState({
        download: { allowed: false, size: 0.0 },
        maxPages: 1,
        pictureCount: 0,
        pictures: [],
        info: { owner: "unknown", tag_name: "unknown" },
    });

    useEffect(() => {
        axios
            .get(route("share.tags.api", [id, page]))
            .then((res) => setData(res.data))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => console.log(data), [data]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 40,
    };

    return (
        <GuestLayout>
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
                    <img src={route("share.get.half", pic.id)} />
                ))}
            </div>
        </GuestLayout>
    );
}
