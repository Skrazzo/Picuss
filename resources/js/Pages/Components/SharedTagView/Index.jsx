import React, { useEffect, useState } from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";
import axios from "axios";

export default function Index({ id }) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);

    useEffect(() => {
        axios
            .get(route("share.tags.api", [id, page]))
            .then((res) => setData(res.data))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => console.log(data), [data]);

    return (
        <GuestLayout>
            <span>Hello world</span>
        </GuestLayout>
    );
}
