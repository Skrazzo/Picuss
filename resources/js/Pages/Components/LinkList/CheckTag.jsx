import {
    ActionIcon,
    Checkbox,
    CopyButton,
    Flex,
    Text,
    Tooltip,
} from "@mantine/core";
import {
    IconCheck,
    IconCopy,
    IconDownload,
    IconEye,
    IconHash,
} from "@tabler/icons-react";
import React from "react";
import capitalizeFirstLetter from "../../Functions/capitalizeFirstLetter";

export default function CheckTag({
    id,
    name,
    views,
    downloads,
    onChange,
    checked,
}) {
    const iconProps = {
        color: "var(--mantine-color-placeholder)",
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <div className={checked ? "checkTag_selected" : "checkTag"}>
            <div className="check">
                <Checkbox checked={checked} onChange={() => onChange(id)} />

                <Flex align={"center"} gap={2}>
                    <IconHash {...iconProps} color={"green"} />
                    <span>{capitalizeFirstLetter(name)}</span>
                </Flex>

                <div className="link">
                    <Text
                        size="sm"
                        c={"dimmed"}
                        onClick={() =>
                            window
                                .open(route("share.tag.page", id), "_blank")
                                .focus()
                        }
                    >
                        {route("share.tag.page", id)}
                    </Text>

                    <CopyButton
                        value={route("share.tag.page", id)}
                        timeout={2000}
                    >
                        {({ copied, copy }) => (
                            <Tooltip
                                label={copied ? "Copied" : "Copy"}
                                withArrow
                                position="right"
                            >
                                <ActionIcon
                                    variant="transparent"
                                    onClick={copy}
                                >
                                    {copied ? (
                                        <IconCheck {...iconProps} />
                                    ) : (
                                        <IconCopy {...iconProps} />
                                    )}
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </CopyButton>
                </div>
            </div>

            <div className="stats">
                <Flex align={"center"} gap={4}>
                    <IconEye {...iconProps} />
                    <Text>{views}</Text>
                </Flex>
                <Flex align={"center"} gap={4}>
                    <IconDownload {...iconProps} />
                    <Text>{downloads}</Text>
                </Flex>
            </div>
        </div>
    );
}
