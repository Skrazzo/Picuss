import React from 'react';
import { ActionIcon, Flex, Menu, Text } from '@mantine/core';
import { IconDotsVertical, IconSelectAll, IconTags, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function TagMenu() {
    const [deleteModal, setDeleteModal] = useDisclosure(false);

    

    return (
        <>
            <Menu>
                <Menu.Target >
                    <ActionIcon variant='subtle'>
                        <IconDotsVertical strokeWidth={2} size={20}/>
                    </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Item color='red' leftSection={<IconTrash strokeWidth={1}/>} onClick={() => setDeleteModal.open()} >
                        <Text mt={2} size='sm'>Delete tags</Text>
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

           <DeleteConfirmModal opened={deleteModal} close={() => setDeleteModal.close()}/> 
        </>
    )
}
