import React from "react";
import { ActionIcon, Flex, Menu, Text } from "@mantine/core";
import { IconBug, IconDotsVertical, IconShare, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import DeleteConfirmModal from "./DeleteConfirmModal";
import axios from "axios";
import showNotification from "../../Functions/showNotification";
import errorNotification from "../../Functions/errorNotification";

export default function TagMenu({ selectedTags, setTags }) {
    const [deleteModal, setDeleteModal] = useDisclosure(false);

    function setTagsAndClose(tags) {
        setTags(tags);
        setDeleteModal.close();
    }

    function shareTags() {
        if (selectedTags.length === 0) {
            showNotification({
                title: "Nothing?",
                message: "To share tags, you need to select them first",
            });
            return;
        }

        axios
            .post(route("tags.share"), { tags: selectedTags })
            .then((res) => {
                axios
                    .get(route("tags.get"))
                    .then((res) => setTags(res.data))
                    .catch((err) => errorNotification(err));
            })
            .catch((err) => errorNotification(err));
    }

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
    };

    return (
        <>
            <Flex gap={8} ml={3}>
                <ActionIcon variant="subtle" color={"red"}>
                    <IconTrash test="delete-tags-icon" {...iconProps} onClick={() => setDeleteModal.open()} />
                </ActionIcon>

                <ActionIcon variant="subtle" color={"dimmed"}>
                    <IconShare {...iconProps} onClick={shareTags} />
                </ActionIcon>
            </Flex>

            <DeleteConfirmModal
                setTagsAndClose={setTagsAndClose}
                selectedTags={selectedTags}
                opened={deleteModal}
                close={() => setDeleteModal.close()}
            />
        </>
    );
}
