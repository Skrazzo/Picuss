import React, { useEffect, useState } from "react";
import { Button, Transition } from "@mantine/core";

export default function ConfirmationModal({
    icon,
    color,
    children: text,
    close,
    opened,
    title,
    onConfirm,
    closeOnConfirm = true,
    onCancel = () => {},
    childrenText = true, // specifies if children are text, or custom elements
    confirmBtnText = "Confirm",
    loading = false,
    hideButtons = false,
}) {
    const [modalOpened, setModalOpened] = useState(false);
    const [confirm, setConfirm] = useState(false);

    function onConfirmHandler() {
        if (confirm) {
            onConfirm();
            if (closeOnConfirm) {
                close();
            }
            return;
        }

        setConfirm(true);
    }

    useEffect(() => {
        if (opened) {
            setTimeout(() => setModalOpened(true), 100);
            setConfirm(false);
        } else {
            setModalOpened(false);
        }
    }, [opened]);

    const iconProps = {
        strokeWidth: 1.25,
        size: 36,
    };

    const colors = {
        red: "var(--mantine-color-red-6)",
        green: "var(--mantine-color-green-6)",
    };

    return (
        <Transition mounted={opened} transition={"fade"} duration={400}>
            {(styles) => (
                <div style={styles} className={"confirm-modal-overlay"}>
                    <Transition mounted={modalOpened} transition={"pop"} duration={200}>
                        {(styles) => (
                            <div
                                style={{
                                    ...styles,
                                    borderColor: colors[color],
                                }}
                                className={"modal"}
                            >
                                <div className={"nav"}>
                                    <div>
                                        <div
                                            className={"icon"}
                                            style={{
                                                backgroundColor: colors[color],
                                            }}
                                        >
                                            {React.cloneElement(icon, iconProps)}
                                        </div>
                                    </div>

                                    <div className={"content"}>
                                        <p className={"label"}>{title}</p>
                                        {childrenText ? <p className={"description"}>{text}</p> : text}
                                    </div>
                                </div>

                                {!hideButtons && (
                                    <div className={"footer"}>
                                        <Button
                                            onClick={onConfirmHandler}
                                            variant={confirm ? "outline" : "light"}
                                            color={colors[color]}
                                            loading={loading}
                                        >
                                            {confirm ? "Are you sure?" : confirmBtnText}
                                        </Button>

                                        <Button
                                            onClick={() => {
                                                onCancel();
                                                close();
                                            }}
                                            variant={confirm ? "light" : "outline"}
                                            color={colors[color]}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </Transition>
                </div>
            )}
        </Transition>
    );
}
