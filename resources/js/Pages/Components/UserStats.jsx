import { SimpleGrid, Skeleton } from "@mantine/core";
import DisabledInputInfo from "./DisabledInputInfo";
import { IconBrandOnedrive, IconPhoto, IconTag, IconTags, IconUpload, IconUser } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

export default function UserStats({ data }) {
    const [usedSpace, setUsedSpace] = useState(0);

    // Create text for used space
    useEffect(() => {
        // `${data.disk_usage > 1024 ? data.disk_usage / 1024 : data.disk_usage} of ${data.user_limit} GB`
        console.log(data);
        if (data === null) return;
        console.log("asd");
        let measurement = "MB";
        if (data.disk_usage > 1024) {
            measurement = "GB";
        }

        // ROUND up
        // TODO: Fix this showing incorrect data
        // Starting with disk_usage is nan, because its not a number but a 300 MB string
        let tmpSpace = data.disk_usage;
        if (measurement === "MB") {
            tmpSpace = Math.round(data.disk_usage * 100) / 100;
        } else {
            tmpSpace = Math.round((data.disk_usage / 1024) * 100) / 100;
        }

        if (data.user_limit !== null && data.user_limit !== 0) {
            console.log(`${tmpSpace} of ${data.user_limit} ${measurement}`);
            setUsedSpace(`${tmpSpace} of ${data.user_limit} ${measurement}`);
        } else {
            console.log("asd123");

            setUsedSpace(`${tmpSpace} ${measurement}`);
        }
    }, [data]);

    const iconProps = {
        size: 20,
        strokeWidth: 1.5,
    };

    return (
        <SimpleGrid cols={2} spacing={"sm"} verticalSpacing={"sm"}>
            {data ? (
                <>
                    <DisabledInputInfo
                        tooltip={"Total pictures uploaded"}
                        icon={<IconPhoto {...iconProps} />}
                        value={data.pictures}
                    />
                    <DisabledInputInfo
                        tooltip={"Total tags made"}
                        icon={<IconTags {...iconProps} />}
                        value={data.tags}
                    />
                    <DisabledInputInfo
                        tooltip={"Last picture was uploaded"}
                        icon={<IconUpload {...iconProps} />}
                        value={data.last_picture_uploaded}
                    />
                    <DisabledInputInfo
                        tooltip={"Last tag was made"}
                        icon={<IconTag {...iconProps} />}
                        value={data.last_tag_created}
                    />
                    <DisabledInputInfo
                        tooltip={"You created your account"}
                        icon={<IconUser {...iconProps} />}
                        value={data.user_created}
                    />
                    <DisabledInputInfo
                        tooltip={"Used storage on the server"}
                        icon={<IconBrandOnedrive {...iconProps} />}
                        value={usedSpace}
                    />
                </>
            ) : (
                <>
                    <Skeleton w={"100%"} h={35} />
                    <Skeleton w={"100%"} h={35} />
                    <Skeleton w={"100%"} h={35} />
                    <Skeleton w={"100%"} h={35} />
                    <Skeleton w={"100%"} h={35} />
                    <Skeleton w={"100%"} h={35} />
                </>
            )}
        </SimpleGrid>
    );
}
