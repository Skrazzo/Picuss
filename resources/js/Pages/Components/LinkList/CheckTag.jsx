import { Checkbox, Flex, Text } from "@mantine/core";
import { IconDownload, IconEye } from "@tabler/icons-react";
import React from "react";

export default function CheckTag({ id, views, downloads, onChange, checked }) {
    const defaultIconProps = {
        color: "var(--mantine-color-placeholder)",
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <div className={checked ? "checkTag_selected" : "checkTag"}>
            <div className="check">
                <Checkbox checked={checked} onChange={() => onChange(id)} />
                <img
                    src={route("get.thumb.image", id)}
                    onClick={() =>
                        window
                            .open(route("share.image.page", id), "_blank")
                            .focus()
                    }
                    alt="thumbnail"
                />
            </div>

            <div className="stats">
                <Flex align={"center"} gap={4}>
                    <IconEye {...defaultIconProps} />
                    <Text>{views}</Text>
                </Flex>
                <Flex align={"center"} gap={4}>
                    <IconDownload {...defaultIconProps} />
                    <Text>{downloads}</Text>
                </Flex>
            </div>
        </div>
    );
}
