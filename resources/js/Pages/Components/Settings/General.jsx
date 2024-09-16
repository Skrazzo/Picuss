import { Chip, Fieldset, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import checkDarkMode from "../../Functions/checkDarkMode";
import { useMediaQuery } from "@mantine/hooks";
import { Button, Input, Text } from "@mantine/core";
import { IconFileShredder } from "@tabler/icons-react";
import "../../../../scss/Settings/General.scss";

const FormInput = ({ useForm, name, label = "", placeholder = "", type = "text" }) => {
    let inputLabel = label;
    if (useForm.hasErrors) inputLabel = useForm.errors[name];

    return (
        <Input.Wrapper label={inputLabel} c={useForm.errors[name] ? "red" : ""}>
            <Input
                error={useForm.errors[name]}
                value={useForm.data[name]}
                onChange={(e) => useForm.setData(name, e.target.value)}
                placeholder={placeholder}
                type={type}
            />
        </Input.Wrapper>
    );
};

export default function General() {
    const [darkMode, setDarkMode] = useState(checkDarkMode());
    const tablet = useMediaQuery("(max-width: 1024px)");

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
                <Chip onChange={(e) => setDarkMode(e)} checked={darkMode}>
                    Dark mode
                </Chip>
            </Fieldset>

            <Fieldset
                // legend={"Delete your account"}
                mt={16}
                p={16}
                // c={"red"}
                className="danger-fieldset"
            >
                <Text size="xl" mb={8}>
                    Delete your account
                </Text>
                <Text>
                    If you delete your account, all of your data will be permanently deleted. And
                    all the pictures you uploaded will be permanently lost, as well as your shared
                    links.
                </Text>

                <Button color="red" leftSection={<IconFileShredder {...iconProps} />} mt={24}>
                    Delete account
                </Button>
            </Fieldset>
        </Paper>
    );
}
