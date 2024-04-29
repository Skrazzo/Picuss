import { Link } from '@inertiajs/inertia-react';
import React from 'react'
import Logo from './Components/Logo';
import sty from '../../scss/dashboard.module.scss';
import { Burger, Drawer, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MenuOption from './Components/MenuOption';
import { IconUpload } from '@tabler/icons-react';

export default function Dashboard({ auth }) {
    const [opened, { toggle }] = useDisclosure();
  
    console.log(auth);

    return (
        <>
            <Drawer opened={opened} onClose={toggle} title="Menu" size={'sm'}>
                <MenuOption icon={<IconUpload />} text={'Upload pictures'} hrefRoute={'upload'}/>
            </Drawer>

            <nav className={sty.nav}>
                <div className={sty.logo}>
                    <Logo size={50}/>
                    <Text>Picuss</Text>
                </div>

                <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
            </nav>
        </>
    )
}
