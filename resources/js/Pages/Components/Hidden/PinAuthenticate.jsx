import { Button, Center, Flex, Group, Modal, PinInput, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconKey } from "@tabler/icons-react";
import React from "react";
import ConfirmationModal from "../ConfirmationModal";

export default function PinAuthenticate({ opened, closeButton = true, firstTime = false }) {
    if (!opened) return <></>;

    const [open, { openModal, closeModal }] = useDisclosure(opened);

    const iconProps = {
        strokeWidth: 1.25,
        size: 20,
    };

    return (
        <ConfirmationModal
            opened={open}
            close={closeModal}
            title={firstTime ? "Create pin-code" : "Enter pin-code"}
            color={"green"}
            icon={<IconKey />}
            childrenText={false}
            confirmBtnText="Create pin-code"
            hideButtons
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

            <PinInput mt={16} size="md" length={6} mask type={"number"} autoFocus />
        </ConfirmationModal>
    );

    return (
        <Modal
            opened={open}
            onClose={closeModal}
            title={""}
            withCloseButton={closeButton}
            size={"480px"}
        >
            <Text align={"center"} size="xl">
                Please enter your pin to access hidden pictures
            </Text>
            <Text align={"center"} mt={8} size="lg" c={"dimmed"} hidden={!firstTime}>
                Entering your pin will create a new pin-code for your user, but won't save it on the
                server, so make sure to remember it.
            </Text>

            <PinInput
                mt={24}
                // size="100%"
                // h={40}
                length={6}
                mask
                type={"number"}
                // autoFocus
            />

            {firstTime && (
                <Group mt={16}>
                    <Button leftSection={<IconKey {...iconProps} />}>Create pin-code</Button>
                </Group>
            )}
        </Modal>
    );
}
