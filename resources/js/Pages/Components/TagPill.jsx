import { Flex, Pill, Transition } from '@mantine/core'
import { IconHash } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'

export default function TagPill({ remove, name }) {
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
            {(styles) => 
                <Pill style={styles} withRemoveButton onRemove={() => setMounted(false)}> 
                    <Flex align={'center'} gap={4}>
                        <IconHash size={14} strokeWidth={1.3} color='var(--mantine-primary-color-8)'/>

                        {name}
                    </Flex>
                </Pill>
            }
        </Transition>
    )
}
