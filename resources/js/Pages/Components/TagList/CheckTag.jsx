import React, { useState } from 'react';
import sty from '../../../../scss/TagList.module.scss';
import { Checkbox, Flex, Input, Text } from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';

export default function CheckTag({ 
    id,
    index,
    name = 'tag name',
    pictureCount = 0,
    checked = false, 
    onChange = () => console.log(`Checkbox with id: ${id} clicked - ${checked}`) 
}) {
    const [nameEdit, setNameEdit] = useState(false);
    const [nameValue, setNameValue] = useState(name);

    return (
        <div className={sty.tag}>
            <Flex align={'center'} gap={8} w={'100%'}>
                <Checkbox />
                {(!nameEdit) 
                ? <Text py={8} px={1} style={{ cursor: 'pointer' }} size='sm' onClick={() => setNameEdit(true)}>{name}</Text>
                : <Input maxLength={20} w={'100%'} autoFocus variant='unstyled' placeholder={name} value={nameValue} onChange={(e) => setNameValue(e.currentTarget.value)}/>
                }
                
            </Flex>

            <Text c="dimmed" mt={3}>{pictureCount}</Text>
        </div>
    )
}
