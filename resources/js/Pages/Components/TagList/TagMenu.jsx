import React from "react";
import { ActionIcon, Menu, Text } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function TagMenu({ selectedTags, setTags }) {
    const [deleteModal, setDeleteModal] = useDisclosure(false);

    function setTagsAndClose(tags) {
        setTags(tags);
        setDeleteModal.close();
    }

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
                        color="red"
                        leftSection={<IconTrash strokeWidth={1} />}
                        onClick={() => setDeleteModal.open()}
                    >
                        <Text mt={2} size="sm">
                            Delete tags
                        </Text>
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
