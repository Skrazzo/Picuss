import React, { useEffect, useState } from "react";
import "../../../../scss/LinkList.scss";
import {
    IconSparkles,
    IconTrash,
    IconTrashFilled,
    IconTrashX,
    IconUnlink,
} from "@tabler/icons-react";
import { ActionIcon, Checkbox, Text } from "@mantine/core";
import CheckTag from "./CheckTag";
import { useDisclosure } from "@mantine/hooks";
import DeleteConfirmModal from "./DeleteConfirmModal";
import axios from "axios";
import showNotification from "../../Functions/showNotification";

export default function LinkList({ links: propLink }) {
    const [selected, setSelected] = useState([]);
    const [links, setLinks] = useState(propLink);
    const [deleteModal, setDeleteModal] = useDisclosure(false);

    console.log(links);

    const empty_list_children = (
        <div className="no-links">
            <IconSparkles
                style={{ opacity: 0.9 }}
                color="var(--mantine-primary-color-filled-hover)"
                stroke={1.25}
            />
            <Text className={"main"}>NO PICTURES SHARED</Text>
            <Text className={"desc"}>
                Cmon show the world how beautiful you are
            </Text>
        </div>
    );

    function checkHander(id) {
        if (selected.includes(id)) {
            setSelected(selected.filter((x) => x !== id));
        } else {
            setSelected([...selected, id]);
        }
    }

    function selectAllHandler() {
        if (selected.length === links.length) {
            setSelected([]);
        } else {
            setSelected([...links.map((x) => x.picture_id)]);
        }
    }

    // useEffect(() => {
    //     console.log(selected);
    // }, [selected]);

    function setLinksAndClose() {
        setDeleteModal.close();

        // backup incase we get errror on our optimistic request
        // And set new links
        const oldLinks = links;
        setLinks([
            ...links.filter((link) => !selected.includes(link.picture_id)),
        ]);
        setSelected([]);

        axios
            .delete(route("share.links.delete"), {
                data: { images: selected },
            })
            .then((res) => {
                showNotification({
                    title: "Deleted",
                    message: "Successfully deleted your shared links",
                    icon: <IconUnlink strokeWidth={1.25} size={20} />,
                });
            })
            .catch((err) => {
                // Api failed so we need to return to previous useState data
                setLinks(oldLinks);
                showNotification({
                    title: "Error occurred",
                    message: "Could not delete your shared images",
                    color: "red",
                    icon: <IconTrashX strokeWidth={1.25} size={20} />,
                });
                console.error(err);
            });
    }

    return (
        <div className="linkList-container">
            <DeleteConfirmModal
                selectedLinks={selected}
                opened={deleteModal}
                close={() => setDeleteModal.close()}
                setLinksAndClose={setLinksAndClose}
            />

            <div className="header">
                <div className="d-flex">
                    <Checkbox
                        checked={false}
                        onChange={selectAllHandler}
                        indeterminate={selected.length === links.length}
                    />

                    <Text c={"dimmed"} fs={"italic"} size="sm">
                        Selected {selected.length}
                        {selected.length === 1 ? " link" : " links"}
                    </Text>
                </div>

                <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => setDeleteModal.open()}
                >
                    <IconTrash strokeWidth={1.25} />
                </ActionIcon>
            </div>

            {links.length === 0 && empty_list_children}

            {links.map((link) => {
                return (
                    <CheckTag
                        key={link.id}
                        id={link.picture_id}
                        views={link.views}
                        downloads={link.downloads}
                        onChange={checkHander}
                        checked={selected.includes(link.picture_id)}
                    />
                );
            })}
        </div>
    );
}
