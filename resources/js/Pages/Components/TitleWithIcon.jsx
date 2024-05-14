import { IconHeading } from '@tabler/icons-react';
import { Flex, Title } from '@mantine/core';
import React from 'react';


export default function TitleWithIcon({ title = 'title', icon = <IconHeading /> , order = 2, flexGap = 8 , my = 1}) {
    return (
        <Flex align={'center'} gap={flexGap} my={my}>
            <div style={{ color: 'var(--mantine-primary-color-8)', display: 'grid', placeItems: 'center', }}>{icon}</div>
            <Title order={order}>{title}</Title>
        </Flex>
    )
}
