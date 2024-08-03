import axios from "axios";
import React, { useEffect, useState } from "react";

export default function AddTags({ selectedPictures, onUpdateGallery, onClose }) {
    const [tags, setTags] = useState(null);

    useEffect(() => {
        axios
            .get(route("tags.images.get", 1), { params: { imageIds: selectedPictures } })
            .then((res) => {
                console.log(res.data);
            });
    }, []);

    // TODO: Checkbox list component to select or deselect tags
    // TODO: Use the same checkbox list component for removeTags modal
    return <div>addTags</div>;
}
