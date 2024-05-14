import React from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Button, Container, Flex, Input } from '@mantine/core';
import TitleWithIcon from './Components/TitleWithIcon';
import { IconTags } from '@tabler/icons-react';


export default function ManageTags({ auth, tags }) {
    console.log(tags);

    return (
        <AuthLayout auth={auth}>
            <Container size={'md'} py={'md'} >
                <TitleWithIcon title='Manage your tags' order={3} icon={<IconTags  size={28} strokeWidth={1.5}/>} my={16}/>
                
                <Flex gap={8}>
                    <Input.Wrapper label="" description="Search or create new tags" error="" w={'100%'}>
                        <Input placeholder="Tag name" />
                    </Input.Wrapper>
                </Flex>
            </Container>
        </AuthLayout>
    )
}
