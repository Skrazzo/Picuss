import { TextInput, Tooltip } from '@mantine/core'
import React from 'react'

export default function DisabledInputInfo({ tooltip, value, icon, openDelay = 1000 }) {
    return (
        <Tooltip label={tooltip} withArrow openDelay={openDelay}>
            <TextInput leftSection={icon} defaultValue={value} disabled />
        </Tooltip>
    )
}
