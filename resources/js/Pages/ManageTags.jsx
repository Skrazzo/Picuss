import React, { useEffect, useState } from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Button, CloseButton, Container, Flex, Input } from '@mantine/core';
import TitleWithIcon from './Components/TitleWithIcon';
import { IconSearch, IconTags } from '@tabler/icons-react';
import TagList from './Components/TagList/TagList';
import { useForm } from '@inertiajs/inertia-react';


export default function ManageTags({ auth, tags }) {
    const [useTags, setUseTags] = useState(tags);

    const form = useForm({
        name: ''
    });

    function formSubmitHandler(e) {
        e.preventDefault();
        if (form.data.name === '') return ;
        
        form.post(route('tags.create'), {
            onSuccess: (res) => setUseTags(res.props.tags),
        });
    }

    return (
        <AuthLayout auth={auth}>
            <Container size={'md'} py={'md'} >
                <TitleWithIcon title={`Manage your ${tags.length} tags`} order={3} icon={<IconTags  size={28} strokeWidth={1.5}/>} my={16}/>
                
                <Flex gap={8}>
                    <Input.Wrapper label="" description="Search or create new tags" error="" w={'100%'}>
                        <form onSubmit={formSubmitHandler}>
                                <Input 
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.currentTarget.value)}
                                    leftSection={<IconSearch size={18} />}
                                    placeholder="Search tag name"
                                    maxLength={20}
                                    error={form.errors.name}
                                />
                        </form>
                    </Input.Wrapper>

                </Flex>

                <TagList tags={useTags} search={form.data.name} setTags={(tags) => setUseTags(tags)}/>
            </Container>
        </AuthLayout>
    )
}
