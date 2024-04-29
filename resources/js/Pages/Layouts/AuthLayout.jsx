import React, { Children } from 'react'
import Logo from '../Components/Logo';
import sty from '../../../scss/dashboard.module.scss';
import { Burger, Drawer, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MenuOption from '../Components/MenuOption';
import { IconUpload } from '@tabler/icons-react';

export default function AuthLayout({ children }) {
    const [opened, { toggle }] = useDisclosure();

    return (
        <>
            <Drawer padding={0} opened={opened} withCloseButton={false} onClose={toggle} size={'sm'}>
                <div className={sty.menu}>
                    <MenuOption icon={<IconUpload />} text={'Upload pictures'} hrefRoute={'upload'}/>
                </div>
            </Drawer>

            <nav className={sty.nav}>
                <div className={sty.logo}>
                    <Logo size={50}/>
                    <Text>Picuss</Text>
                </div>

                <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
            </nav>

            {children}
        </>
    )
}
