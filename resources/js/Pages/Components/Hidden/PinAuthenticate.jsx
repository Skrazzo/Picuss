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
    onSuccessAuth,
    closeButton = true,
    firstTime: firstTimeProp = null,
}) {
    if (!opened) return <></>;

    const [firstTime, setFirstTime] = useState(firstTimeProp);
    const [open, setModal] = useDisclosure(opened);
    const [pinForm, setPinForm] = useState({
        pin: null,
        error: null,
    });

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
            if (res.data.authenticated) {
                onSuccessAuth();
                return;
            }
            setFirstTime(!res.data.hasPin);
        });
    }, []);

    const authenticate = () => {
        axios
            .post(route("hidden.auth"), { pin: pinForm.pin })
            .then((res) => onSuccessAuth())
            .catch((err) => {
                console.error(err);
                if (err.response.status === 422) {
                    // Validation error

                    console.log(JSON.parse(err.response.data).pin);
                    setPinForm({
                        pin: "",
                        error: JSON.parse(err.response.data).pin,
                    });
                } else {
                    console.log(err);
                    setPinForm({
                        pin: "",
                        error: err.response.data["message"],
                    });
                }
            });
    };

    useEffect(() => {
        if (firstTime) {
            return;
        }

        if (pinForm.pin !== null && pinForm.pin.length === 6) {
            authenticate();
        }
    }, [pinForm]);

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
            closeOnConfirm={false}
        >
            {firstTime && (
                <Text mt={8} size="lg" c={"dimmed"}>
                    Entering your pin will create a new pin-code for your user, but won't save it on the server, so make
                    sure to remember it.
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
                value={pinForm.pin}
                onChange={(e) => setPinForm({ ...pinForm, pin: e })}
                error={pinForm.error}
            />
            {pinForm.error && (
                <Text c={"red"} size="sm" mt={8}>
                    {pinForm.error}
                </Text>
            )}
        </ConfirmationModal>
    );
}
