import { Button, Text } from "@mantine/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import TagCheckBoxList from "../TagCheckBoxList";
import { IconPlus } from "@tabler/icons-react";
import errorNotification from "../../Functions/errorNotification";

export default function AddTags({ selectedPictures, onUpdateGallery, onClose }) {
    const [tags, setTags] = useState(null);
    const [selectedTags, setSelectedTags] = useState([]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
    };

    useEffect(() => {
        axios
            .get(route("tags.images.get", 1), { params: { imageIds: selectedPictures } })
            .then((res) => setTags(res.data));
    }, []);

    function submitTags() {
        // TODO: Create axios request to create
        console.log(selectedPictures, selectedTags);
        axios
            .post(route("tags.images.set"), { pictures: selectedPictures, tags: selectedTags })
            .then((res) => console.log(res.data))
            .catch((err) => errorNotification(err));
    }

    useEffect(() => console.log("selected", selectedTags), [selectedTags]);

    // TODO: Create backend for it (Submiting selectedPictures, and selectedTags) when successful update gallery
    return (
        <>
            <TagCheckBoxList tags={tags} selectedTags={selectedTags} onChange={setSelectedTags} />
            <Button
                mt={8}
                leftSection={<IconPlus {...iconProps} />}
                variant="light"
                onClick={submitTags}
                disabled={tags === null || tags.length === 0 || selectedTags.length === 0}
            >
                Add tags
            </Button>
        </>
    );
}