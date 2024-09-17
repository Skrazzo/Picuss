import { SimpleGrid, Skeleton } from "@mantine/core";
import DisabledInputInfo from "./DisabledInputInfo";
import {
    IconBrandOnedrive,
    IconPhoto,
    IconTag,
    IconTags,
    IconUpload,
    IconUser,
} from "@tabler/icons-react";

export default function UserStats({ data }) {
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
                        value={data.disk_usage}
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
