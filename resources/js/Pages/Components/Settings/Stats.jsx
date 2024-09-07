import { Paper } from "@mantine/core";
import axios from "axios";
import { useEffect } from "react";

export default function Stats() {
    useEffect(() => {
        axios.get(route("settings.get.stats")).then((res) => console.log(res.data));
    }, []);

    return (
        <Paper withBorder mx={16}>
            Hello world
        </Paper>
    );
}
