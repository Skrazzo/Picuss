import React from 'react';
import sty from '../../../scss/TagList.module.scss';
import { ActionIcon, Flex, Text } from '@mantine/core';
import { IconSelectAll, IconTags } from '@tabler/icons-react';

export default function TagList({ tags }) {
    console.log(tags);
    
    return (
        <div className={sty.container}>
            <div className={sty.head}>
                <Flex align={'center'} gap={4}>
                    <ActionIcon variant='subtle' size={'lg'} >
                        <IconSelectAll strokeWidth={1.5}/>
                    </ActionIcon>
                    <Text className={sty.selected}> Selected 4 tags</Text>
                </Flex>
            </div>
        </div>
    )
}
