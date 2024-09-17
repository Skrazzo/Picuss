import { ActionIcon, Button, Checkbox, Chip, Fieldset, Flex, Input, Paper } from "@mantine/core";
import { useEffect, useState } from "react";
import checkDarkMode from "../../Functions/checkDarkMode";
import { useMediaQuery } from "@mantine/hooks";
import { Button, Input, Text } from "@mantine/core";
import { IconFileShredder } from "@tabler/icons-react";
import "../../../../scss/Settings/General.scss";
import { useForm } from "@inertiajs/inertia-react";
import { IconCheck } from "@tabler/icons-react";

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
    const tablet = useMediaQuery("(max-width: 1130px)");

    const newPassword = useForm({
        current: "",
        new: "",
        new_confirmation: "",
    });

    function newPasswordHandler(e) {
        e.preventDefault();
        newPassword.put(route("password.update"), {
            onSuccess: () => newPassword.reset(),
        });
    }

    useEffect(() => {
        if (darkMode) {
            localStorage.setItem("picuss-dark", true);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "dark");
        } else {
            localStorage.setItem("picuss-dark", false);
            document.querySelector("html").setAttribute("data-mantine-color-scheme", "light");
        }
    }, [darkMode]);

    const iconProps = {
        size: 20,
        strokeWidth: 1.5,
    };

    return (
        <Paper mx={tablet ? 0 : 16} my={tablet ? 16 : 0}>
            <Fieldset legend={"Theme"} p={16}>
                <Checkbox
                    onChange={(e) => setDarkMode(e.target.checked)}
                    checked={darkMode}
                    label={"Dark mode"}
                />
            </Fieldset>

            <Fieldset legend={"Change account password"} mt={16} p={16}>
                <form onSubmit={newPasswordHandler}>
                    <Flex direction={"column"} gap={8}>
                        <FormInput
                            useForm={newPassword}
                            placeholder="Current password"
                            name={"current"}
                            type={"password"}
                        />
                        <FormInput
                            useForm={newPassword}
                            placeholder="New password"
                            name={"new"}
                            type={"password"}
                        />
                        <FormInput
                            useForm={newPassword}
                            placeholder="Confirm new password"
                            name={"new_confirmation"}
                            type={"password"}
                        />
                        <div>
                            <Button
                                onClick={newPasswordHandler}
                                leftSection={<IconCheck {...iconProps} />}
                                variant="default"
                            >
                                Save
                            </Button>
                        </div>
                    </Flex>
                </form>
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
