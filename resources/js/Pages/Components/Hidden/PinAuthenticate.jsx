import { PinInput, Skeleton, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconKey } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import ConfirmationModal from "../ConfirmationModal";
import axios from "axios";
import errorNotification from "../../Functions/errorNotification";
import { useForm } from "@inertiajs/react";

export default function PinAuthenticate({
    opened,
    onClose,
    closeButton = true,
    firstTime: firstTimeProp = null,
}) {
    if (!opened) return <></>;

    const [firstTime, setFirstTime] = useState(firstTimeProp);
    const [open, setModal] = useDisclosure(opened);

    // TODO: remove if nott needed
    // const iconProps = {
    //     strokeWidth: 1.25,
    //     size: 20,
    // };

    const closeModal = () => {
        setModal.close();
        setTimeout(() => onClose(), 300);
    };

    // Fetch user hidden data, in case firstTimeProp is not provided
    useEffect(() => {
        if (firstTime !== null) {
            return;
        }

        axios.get(route("hidden.info")).then((res) => {
            setFirstTime(!res.data.hasPin);
        });
    }, []);

    const pinForm = useForm({
        pin: null,
    });
    const authenticate = () => {
        pinForm.post(route("hidden.auth"), {
            onSuccess: (res) => {
                console.log(res);
            },
            onError: (err) => {
                console.error(err);
            },
        });
    };

    // TODO: Create pin-code
    // TODO: Encrypt first files

    if (firstTime === null) {
        return (
            <ConfirmationModal
                opened={open}
                close={closeModal}
                title={<Skeleton h={35} />}
                color={"green"}
                icon={<IconKey />}
                childrenText={false}
                loading={true}
                onConfirm={() => {}}
            >
                <Skeleton mt={16} h={16} />
                <Skeleton mt={8} h={16} w={"40%"} />
                <Skeleton mt={8} h={16} w={"70%"} />
            </ConfirmationModal>
        );
    }

    return (
        <ConfirmationModal
            opened={open}
            close={closeModal}
            title={firstTime ? "Create pin-code" : "Enter pin-code"}
            color={"green"}
            icon={<IconKey />}
            childrenText={false}
            confirmBtnText="Create pin-code"
            hideButtons={!firstTime}
            onConfirm={authenticate}
        >
            {firstTime && (
                <Text mt={8} size="lg" c={"dimmed"}>
                    Entering your pin will create a new pin-code for your user, but won't save it on
                    the server, so make sure to remember it.
                </Text>
            )}

            {!firstTime && (
                <Text mt={8} size="lg" c={"dimmed"}>
                    You need to enter you pin-code, in order to access hidden pictures
                </Text>
            )}

            <PinInput
                mt={16}
                size="md"
                length={6}
                mask
                type={"number"}
                autoFocus
                value={pinForm.data.pin}
                onChange={(e) => pinForm.setData("pin", e)}
                error={pinForm.hasErrors}
            />
            {pinForm.hasErrors && (
                <Text c={"red"} size="sm" mt={8}>
                    {pinForm.errors.pin}
                </Text>
            )}
        </ConfirmationModal>
    );
}
