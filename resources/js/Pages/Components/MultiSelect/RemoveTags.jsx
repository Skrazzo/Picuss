import { Button } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TagCheckBoxList from "../TagCheckBoxList";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import errorNotification from "../../Functions/errorNotification";
import showNotification from "../../Functions/showNotification";

export default function RemoveTags({ selectedPictures, onUpdateGallery, onClose }) {
    const [tags, setTags] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
    };

    useEffect(() => {
        axios
            .get(route("tags.images.get", 2), { params: { imageIds: selectedPictures } })
            .then((res) => setTags(res.data));
    }, []);

    // TODO: Remove console.log
    function submitTags() {
        console.log(selectedPictures, selectedTags);
        axios
            .delete(route("tags.images.remove"), {
                params: { pictures: selectedPictures, tags: selectedTags },
            })
            .then((res) => {
                showNotification({ title: "Success", message: res.data.message });
                onUpdateGallery();
                onClose();
            })
            .catch((err) => errorNotification(err));
    }

    return (
        <>
            <TagCheckBoxList tags={tags} selectedTags={selectedTags} onChange={setSelectedTags} color="red" />
            <Button
                mt={8}
                leftSection={<IconTrash {...iconProps} />}
                variant="light"
                color="red"
                onClick={submitTags}
                disabled={
                    tags === null ||
                    tags.length === 0 ||
                    selectedTags.length === 0 ||
                    selectedTags.length === tags.length
                }
            >
                Remove tags
            </Button>
        </>
    );
}
