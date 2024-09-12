import { Checkbox, Chip, Fieldset, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import checkDarkMode from "../../Functions/checkDarkMode";
import { useMediaQuery } from "@mantine/hooks";

export default function General() {
    const [darkMode, setDarkMode] = useState(checkDarkMode());
    const tablet = useMediaQuery("(max-width: 1130px)");

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("picuss-dark", true);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "dark");
        } else {
            localStorage.setItem("picuss-dark", false);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "light");
        }
    }, [darkMode]);

    // TODO: Start making general, password change, account deletion

    return (
        <Paper mx={tablet ? 0 : 16} my={tablet ? 16 : 0}>
            <Fieldset legend={"Theme"} p={16}>
                <Checkbox
                    onChange={(e) => setDarkMode(e.target.checked)}
                    checked={darkMode}
                    label={"Dark mode"}
                />
            </Fieldset>

            <Fieldset></Fieldset>
        </Paper>
    );
}
