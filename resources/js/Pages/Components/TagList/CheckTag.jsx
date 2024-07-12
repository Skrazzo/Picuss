import React, { useEffect, useState } from "react";
import sty from "../../../../scss/TagList.module.scss";
import {
    ActionIcon,
    Checkbox,
    CopyButton,
    Flex,
    Input,
    Loader,
    Text,
    Tooltip,
} from "@mantine/core";
import axios from "axios";
import showNotification from "../../Functions/showNotification";
import {
    IconCheck,
    IconCopy,
    IconDeviceFloppy,
    IconError404,
    IconShareOff,
} from "@tabler/icons-react";

export default function CheckTag({
    id,
    name = "tag name",
    pictureCount = 0,
    checked = false,
    onChange = () =>
        console.log(`Checkbox with id: ${id} clicked - ${checked}`),
    setTags = (tags) => console.log("New tags", tags),
}) {
    // Use state variables
    const [nameEdit, setNameEdit] = useState(false);
    const [nameValue, setNameValue] = useState(name);
    const [processing, setProcessing] = useState(false);

    // functions
    function editName(newName) {
        // Some Checks
        if (newName === "") return;
        if (processing) return;

        setProcessing(true);

        axios
            .put(route("tags.editName", id), {
                name: newName,
            })
            .then((res) => {
                showNotification({
                    message: res.data.message,
                    title: `Success`,
                    icon: <IconDeviceFloppy strokeWidth={1.25} size={20} />,
                });

                setTags(res.data.tags);
            })
            .catch((err) => {
                showNotification({
                    message: err.response.data.message,
                    title: `${err.response.statusText} - ${err.response.status}`,
                    color: "red",
                    icon: <IconError404 strokeWidth={1.25} />,
                });
                console.log(err);
            })
            .finally(() => {
                setProcessing(false);
                setNameEdit(false);
            });
    }

    // useEffects
    // Use effect to detect for when user stops writing, so we can send a request to the backend
    useEffect(() => {
        // Do some checks
        if (!nameEdit) return;
        if (processing) return;

        const timeoutID = setTimeout(() => {
            editName(nameValue);
        }, 2000);
        return () => clearTimeout(timeoutID);
    }, [nameValue]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
        color: "var(--mantine-color-placeholder)",
        style: { cursor: "pointer" },
    };

    return (
        <div className={checked ? sty.tag_selected : sty.tag}>
            <Flex align={"center"} gap={8} w={"100%"}>
                <Checkbox
                    onChange={() => onChange(id)}
                    value={id}
                    checked={checked}
                />
                {!nameEdit ? (
                    <>
                        {processing && <Loader size={14} />}
                        <Text
                            py={8}
                            px={1}
                            style={{
                                cursor: "pointer",
                                borderBottom: "1px solid transparent",
                            }}
                            size="sm"
                            onClick={() => setNameEdit(true)}
                        >
                            {nameValue}
                        </Text>
                    </>
                ) : (
                    <>
                        {" "}
                        {processing && <Loader size={14} />}{" "}
                        <Input
                            onBlur={() => setNameEdit(false)}
                            maxLength={20}
                            autoFocus
                            variant="unstyled"
                            placeholder={name}
                            value={nameValue}
                            onChange={(e) =>
                                setNameValue(e.currentTarget.value)
                            }
                            style={{
                                borderBottom:
                                    "1px solid var(--mantine-color-default-border)",
                            }}
                        />
                    </>
                )}
            </Flex>

            <Flex align={"center"} gap={16}>
                <Flex align={"center"} gap={8}>
                    <CopyButton
                        value={route("share.image.page", id)}
                        timeout={2000}
                    >
                        {({ copied, copy }) => (
                            <Tooltip
                                label={copied ? "Copied" : "Copy"}
                                withArrow
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
                    <Tooltip label={"Remove share"} withArrow>
                        <IconShareOff {...iconProps} />
                    </Tooltip>
                </Flex>

                <Text c="dimmed" mt={3}>
                    {pictureCount}
                </Text>
            </Flex>
        </div>
    );
}
