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
    IconTagOff,
} from "@tabler/icons-react";
import errorNotification from "../../Functions/errorNotification";
import ConfirmationModal from "../ConfirmationModal";

export default function CheckTag({
    id,
    shared,
    public_id,
    name = "tag name",
    pictureCount = 0,
    checked = false,
    onChange = () => console.log(`Checkbox with id: ${id} clicked - ${checked}`),
    setTags = (tags) => console.log("New tags", tags),
    softDelete = false,
}) {
    // Use state variables
    const [nameEdit, setNameEdit] = useState(false);
    const [nameValue, setNameValue] = useState(name);
    const [processing, setProcessing] = useState(false);

    const [confirmSoftDelete, setConfirmSoftDelete] = useState(false);

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

    function unShare() {
        // setShareRemoved(true);
        axios
            .delete(route("tags.share.remove"), { data: { tags: [public_id] } })
            .then((res) => {
                // Update tag list
                axios
                    .get(route("tags.get"))
                    .then((res) => {
                        // setShareRemoved(false);
                        setTags(res.data);
                    })
                    .catch((err) => errorNotification(err));
            })
            .catch((err) => {
                // setShareRemoved(false);
                errorNotification(err);
            });
    }

    // TODO: Add new feature, that shows button when soft delete is available, and tooltip that explains it
    function softDeleteTag() {
        axios
            .delete(route("tags.softDelete"), { params: { tag_id: id } })
            .then((res) => {
                showNotification({ message: res.data.message, title: "Success" });
                setTags(res.data.tags);
            })
            .catch((err) => errorNotification(err));
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
            <ConfirmationModal
                icon={<IconTagOff />}
                opened={confirmSoftDelete}
                close={() => setConfirmSoftDelete(false)}
                color={"red"}
                title={"Soft delete"}
                onConfirm={softDeleteTag}
            >
                Do you want to delete <strong>"{name}"</strong> tag? This wont affect any pictures
                associated with the tag
            </ConfirmationModal>

            <Flex align={"center"} gap={8} w={"100%"}>
                <Checkbox onChange={() => onChange(id)} value={id} checked={checked} />
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
                            onChange={(e) => setNameValue(e.currentTarget.value)}
                            style={{
                                borderBottom: "1px solid var(--mantine-color-default-border)",
                            }}
                        />
                    </>
                )}
            </Flex>

            <Flex align={"center"} gap={16}>
                <Flex align={"center"} gap={8}>
                    {softDelete && (
                        <Tooltip
                            openDelay={2000}
                            withArrow
                            multiline
                            maw={300}
                            label={
                                "Soft delete lets you delete tag, without deleting pictures\n that belong to it, this is available only when all of the pictures have multiple tags applied to them"
                            }
                        >
                            <IconTagOff {...iconProps} onClick={() => setConfirmSoftDelete(true)} />
                        </Tooltip>
                    )}
                    {shared && (
                        <>
                            <CopyButton value={route("share.tag.page", public_id)} timeout={2000}>
                                {({ copied, copy }) => (
                                    <Tooltip
                                        label={copied ? "Copied" : "Copy"}
                                        withArrow
                                        openDelay={1000}
                                    >
                                        <ActionIcon variant="transparent" onClick={copy}>
                                            {copied ? (
                                                <IconCheck {...iconProps} />
                                            ) : (
                                                <IconCopy {...iconProps} />
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton>
                            <Tooltip label={"Remove share"} withArrow openDelay={1000}>
                                <IconShareOff {...iconProps} onClick={unShare} />
                            </Tooltip>
                        </>
                    )}
                </Flex>

                <Text c="dimmed" mt={3}>
                    {pictureCount}
                </Text>
            </Flex>
        </div>
    );
}
