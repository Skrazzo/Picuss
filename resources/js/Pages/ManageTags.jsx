import React, { useState } from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Button, CloseButton, Container, Flex, Input } from '@mantine/core';
import TitleWithIcon from './Components/TitleWithIcon';
import { IconSearch, IconTags } from '@tabler/icons-react';
import TagList from './Components/TagList/TagList';


export default function ManageTags({ auth, tags }) {
    const [search, setSearch] = useState('');
    
    return (
        <AuthLayout auth={auth}>
            <Container size={'md'} py={'md'} >
                <TitleWithIcon title={`Manage your ${tags.length} tags`} order={3} icon={<IconTags  size={28} strokeWidth={1.5}/>} my={16}/>
                
                <Flex gap={8}>
                    <Input.Wrapper label="" description="Search or create new tags" error="" w={'100%'}>
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            leftSection={<IconSearch size={18} />}
                            placeholder="Search tag name"
                        />
                    </Input.Wrapper>
                </Flex>

                <TagList tags={tags} search={search}/>
            </Container>
        </AuthLayout>
    )
}
