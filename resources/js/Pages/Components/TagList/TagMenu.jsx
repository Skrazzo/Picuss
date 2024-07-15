import React from "react";
import { ActionIcon, Menu, Text } from "@mantine/core";
import {
    IconBug,
    IconDotsVertical,
    IconShare,
    IconTrash,
} from "@tabler/icons-react";
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
            <Menu>
                <Menu.Target>
                    <ActionIcon variant="subtle">
                        <IconDotsVertical strokeWidth={2} size={20} />
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item
                        leftSection={<IconShare {...iconProps} />}
                        onClick={shareTags}
                    >
                        <Text size="sm">Share tags</Text>
                    </Menu.Item>
                    <Menu.Item
                        color="red"
                        leftSection={<IconTrash {...iconProps} />}
                        onClick={() => setDeleteModal.open()}
                    >
                        <Text size="sm">Delete tags</Text>
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            <DeleteConfirmModal
                setTagsAndClose={setTagsAndClose}
                selectedTags={selectedTags}
                opened={deleteModal}
                close={() => setDeleteModal.close()}
            />
        </>
    );
}
