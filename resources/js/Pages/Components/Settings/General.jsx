import { Chip, Fieldset, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import checkDarkMode from "../../Functions/checkDarkMode";

export default function General() {
    const [darkMode, setDarkMode] = useState(checkDarkMode());

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("picuss-dark", true);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "dark");
        } else {
            localStorage.setItem("picuss-dark", false);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "light");
        }
    }, [darkMode]);

    return (
        <Paper mx={16}>
            <Fieldset legend={"Theme"} p={16}>
                <Chip onChange={(e) => setDarkMode(e)} checked={darkMode}>
                    Dark mode
                </Chip>
            </Fieldset>
        </Paper>
    );
}
