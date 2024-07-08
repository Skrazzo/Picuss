import React, { useEffect, useState } from "react";
import sty from "../../../../scss/DeleteConfirmModel.module.scss";
import { Button, Transition } from "@mantine/core";
import {
    IconClick,
    IconError404,
    IconFileMinus,
    IconTrash,
} from "@tabler/icons-react";
import axios from "axios";
import showNotification from "../../Functions/showNotification";

export default function DeleteConfirmModal({
    opened,
    close,
    selectedLinks = [],
    setLinksAndClose,
}) {
    const [modalOpened, setModalOpened] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    function onDeleteHandler() {
        if (!confirm) {
            setConfirm(true);
            return;
        }

        setLinksAndClose();
    }

    useEffect(() => {
        if (opened) {
            setTimeout(() => setModalOpened(true), 100);
            setConfirm(false);
        } else {
            setModalOpened(false);
        }
    }, [opened]);

    return (
        <Transition mounted={opened} transition={"fade"} duration={400}>
            {(styles) => (
                <div style={styles} className={sty.overlay}>
                    <Transition
                        mounted={modalOpened}
                        transition={"pop"}
                        duration={200}
                    >
                        {(styles) => (
                            <div style={styles} className={sty.modal}>
                                <div className={sty.nav}>
                                    <div>
                                        <div className={sty.icon}>
                                            {selectedLinks.length === 0 ? (
                                                <IconClick size={36} />
                                            ) : (
                                                <IconTrash size={36} />
                                            )}
                                        </div>
                                    </div>

                                    <div className={sty.content}>
                                        {selectedLinks.length !== 0 ? (
                                            <>
                                                <p className={sty.label}>
                                                    Delete{" "}
                                                    {selectedLinks.length === 1
                                                        ? "Link"
                                                        : "Links"}
                                                </p>
                                                <p className={sty.description}>
                                                    Are you sure you want to
                                                    delete{" "}
                                                    <b
                                                        style={{
                                                            color: "var(--mantine-color-red-text)",
                                                        }}
                                                    >
                                                        {selectedLinks.length}
                                                    </b>{" "}
                                                    {selectedLinks.length === 1
                                                        ? "link"
                                                        : "links"}
                                                    ? If you delete these links,
                                                    people with who you shared
                                                    them won't be able to view
                                                    them anymore
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className={sty.label}>
                                                    Select Links
                                                </p>
                                                <p className={sty.description}>
                                                    Before deleting any links,
                                                    you need to choose which
                                                    shared links you want to
                                                    delete. You can do that by
                                                    checking boxes in the list
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className={sty.footer}>
                                    {selectedLinks.length !== 0 && (
                                        <Button
                                            onClick={onDeleteHandler}
                                            variant={
                                                confirm ? "outline" : "light"
                                            }
                                            color="red"
                                            loading={loading}
                                        >
                                            {confirm
                                                ? "Are you sure?"
                                                : "Delete links"}
                                        </Button>
                                    )}

                                    <Button
                                        disabled={loading}
                                        onClick={close}
                                        variant={
                                            selectedLinks.length === 0
                                                ? "light"
                                                : "subtle"
                                        }
                                        color="red"
                                    >
                                        {selectedLinks.length === 0
                                            ? "Go back"
                                            : "Cancel"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Transition>
                </div>
            )}
        </Transition>
    );
}
