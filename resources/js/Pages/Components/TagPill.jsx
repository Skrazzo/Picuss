import { Flex, Pill, Text, Transition } from "@mantine/core";
import { IconHash } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

export default function TagPill({ remove, name, test }) {
    const transitionDuration = 100; // In miliseconds
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Transition
            mounted={mounted}
            transition="pop"
            duration={transitionDuration}
            timingFunction="ease"
            onExited={remove}
        >
            {(styles) => (
                <Pill style={styles} withRemoveButton onRemove={() => setMounted(false)} py={2} pr={4}>
                    <Flex test={test || ""} align={"end"} gap={2}>
                        <IconHash size={16} strokeWidth={1.25} color="var(--mantine-primary-color-8)" />

                        <Text size="xs">{name}</Text>
                    </Flex>
                </Pill>
            )}
        </Transition>
    );
}
