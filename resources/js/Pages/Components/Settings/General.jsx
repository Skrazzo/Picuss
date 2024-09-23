import { Button, Checkbox, Fieldset, Flex, Group, Input, Paper, Text, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import checkDarkMode from "../../Functions/checkDarkMode";
import { useMediaQuery } from "@mantine/hooks";
import { IconCloudLock, IconFileShredder, IconLockOff } from "@tabler/icons-react";
import "../../../../scss/Settings/General.scss";
import { useForm } from "@inertiajs/inertia-react";
import { IconCheck } from "@tabler/icons-react";
import ConfirmationModal from "../ConfirmationModal";

const FormInput = ({ useForm, name, label = "", placeholder = "", type = "text", ...props }) => {
    let inputLabel = label;
    if (useForm.hasErrors) inputLabel = useForm.errors[name] || label;

    return (
        <Input.Wrapper label={inputLabel} c={useForm.errors[name] ? "red" : ""}>
            <Input
                maxLength={props.maxLength || null}
                error={useForm.errors[name]}
                value={useForm.data[name]}
                onChange={(e) => useForm.setData(name, e.target.value)}
                placeholder={placeholder}
                type={type}
            />
        </Input.Wrapper>
    );
};

export default function General({ hasPin: hasPinDB }) {
    const [hasPin, setHasPin] = useState(hasPinDB);
    const [darkMode, setDarkMode] = useState(checkDarkMode());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showResetPin, setShowResetPin] = useState(false);
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

    const deleteAccount = useForm({
        password: "",
    });

    function deleteAccountHandler() {
        deleteAccount.delete(route("delete.account"), {
            onSuccess: () => {
                setShowDeleteModal(false);
                deleteAccount.reset();
            },
            onError: (err) => {
                deleteAccount.reset();
                console.warn(err);
            },
        });
    }

    const newPinForm = useForm({
        current: "",
        new: "",
        new_confirmation: "",
    });

    function newPinFormHandler(e) {
        e.preventDefault();
        newPinForm.put(route("change.hidden.pin"), {
            onSuccess: () => newPinForm.reset(),
            onError: (err) => console.warn(err),
        });
    }

    const resetPinForm = useForm({
        password: "",
    });

    function resetPinHandler() {
        resetPinForm.delete(route("delete.hidden.pin"), {
            onSuccess: () => {
                resetPinForm.reset();
                setHasPin(false);
                setShowResetPin(false);
            },
            onError: (err) => console.warn(err),
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
                <Checkbox onChange={(e) => setDarkMode(e.target.checked)} checked={darkMode} label={"Dark mode"} />
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
                        <FormInput useForm={newPassword} placeholder="New password" name={"new"} type={"password"} />
                        <FormInput
                            useForm={newPassword}
                            placeholder="Confirm new password"
                            name={"new_confirmation"}
                            type={"password"}
                        />
                        <div>
                            <Button
                                onClick={newPasswordHandler}
                                loading={newPassword.processing}
                                leftSection={<IconCheck {...iconProps} />}
                                variant="default"
                            >
                                Save
                            </Button>
                        </div>
                    </Flex>
                </form>
            </Fieldset>

            <Fieldset legend={"Change hidden image pin"} mt={16} p={16}>
                <ConfirmationModal
                    title={"Reset pin-code"}
                    icon={<IconLockOff />}
                    opened={showResetPin}
                    color={"red"}
                    childrenText={false}
                    onConfirm={resetPinHandler}
                    closeOnConfirm={false}
                    close={() => {
                        setShowResetPin(false);
                        resetPinForm.reset();
                    }}
                    loading={resetPinForm.processing}
                >
                    <Text c={"dimmed"} mt={8}>
                        Are you sure you wish to reset your hidden pin-code? All hidden images will be deleted.
                    </Text>

                    <Input.Wrapper error={resetPinForm.errors.password}>
                        <Input
                            value={resetPinForm.data.password}
                            onChange={(e) => resetPinForm.setData("password", e.target.value)}
                            autoFocus
                            error
                            type="password"
                            mt={8}
                            placeholder="Your password"
                        />
                    </Input.Wrapper>
                </ConfirmationModal>

                {hasPin ? (
                    <form action="" onSubmit={newPinFormHandler}>
                        <Group gap={8} grow>
                            <FormInput
                                maxLength={6}
                                useForm={newPinForm}
                                name={"current"}
                                label="Current pin"
                                placeholder="******"
                                type="password"
                            />
                            <FormInput
                                maxLength={6}
                                useForm={newPinForm}
                                name={"new"}
                                label="New pin"
                                placeholder="******"
                                type="password"
                            />
                            <FormInput
                                maxLength={6}
                                useForm={newPinForm}
                                name={"new_confirmation"}
                                label="Confirm new pin"
                                placeholder="******"
                                type="password"
                            />
                        </Group>
                        <Flex mt={8}>
                            <Button
                                loading={newPinForm.processing}
                                onClick={newPinFormHandler}
                                leftSection={<IconCloudLock {...iconProps} />}
                            >
                                Change pin
                            </Button>
                            <Button onClick={() => setShowResetPin(true)} variant="transparent">
                                Forgot your pin
                            </Button>
                        </Flex>
                    </form>
                ) : (
                    <Text>
                        You can change your hidden picture pin-code when you create it. To create pin-code you need to
                        hold on a picture to enter multi selection mode &rarr; select pictures &rarr; multi select
                        dropdown &rarr; hide
                    </Text>
                )}
            </Fieldset>

            <Fieldset mt={16} p={16} className="danger-fieldset">
                <ConfirmationModal
                    childrenText={false}
                    icon={<IconFileShredder />}
                    color="red"
                    opened={showDeleteModal}
                    title={"Verify deletion"}
                    onConfirm={deleteAccountHandler}
                    closeOnConfirm={false}
                    close={() => {
                        setShowDeleteModal(false);
                        deleteAccount.reset();
                    }}
                    loading={deleteAccount.processing}
                >
                    <Text mt={16} c={"dimmed"}>
                        Please enter your account password to verify that you want to delete your account.
                    </Text>
                    <Input.Wrapper error={deleteAccount.errors.password}>
                        <Input
                            value={deleteAccount.data.password}
                            onChange={(e) => deleteAccount.setData("password", e.target.value)}
                            autoFocus
                            error
                            type="password"
                            mt={8}
                            placeholder="Your password"
                        />
                    </Input.Wrapper>
                </ConfirmationModal>

                <Text size="xl" mb={8}>
                    Delete your account
                </Text>
                <Text c={"dimmed"}>
                    If you delete your account, all of your data will be permanently deleted. And all the pictures you
                    uploaded will be permanently lost, as well as your shared links.
                </Text>

                <Button
                    color="red"
                    leftSection={<IconFileShredder {...iconProps} />}
                    mt={24}
                    onClick={() => setShowDeleteModal(true)}
                >
                    Delete account
                </Button>
            </Fieldset>
        </Paper>
    );
}
