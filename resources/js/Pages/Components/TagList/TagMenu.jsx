import React from 'react';
import { ActionIcon, Flex, Menu, Text } from '@mantine/core';
import { IconDotsVertical, IconSelectAll, IconTags, IconTrash } from '@tabler/icons-react';

export default function TagMenu({ 
    allSelected = false, 
    selectAll = () => console.log('Select all'), 
    deSelectAll = () => console.log('Deselect all'), 
    deleteTags = () => console.log('delete pressed'),
    
}) {
    return (
        <Menu>
            <Menu.Target >
                <ActionIcon variant='subtle'>
                    <IconDotsVertical strokeWidth={2} size={20}/>
                </ActionIcon>
            </Menu.Target>
        </Menu>
    )
}
