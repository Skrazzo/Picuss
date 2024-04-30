import React, { Children } from 'react'
import Logo from '../Components/Logo';
import sty from '../../../scss/authLayout.module.scss';
import { Burger, CloseButton, Drawer, Modal, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MenuOption from '../Components/MenuOption';
import { IconPhoto, IconUpload } from '@tabler/icons-react';

export default function AuthLayout({ auth, children }) {
    const [openedDrawer, drawer] = useDisclosure();
    const [openedUserModal, userModal] = useDisclosure();

    return (
        <>
            <Modal opened={openedUserModal} onClose={userModal.close} title={auth.user.username}>
                {/* Modal content */}
            </Modal>

            <Drawer padding={0} opened={openedDrawer} withCloseButton={false} onClose={drawer.close} size={'sm'}>
                <div className={sty.menu_header}>
                    <span onClick={() => {drawer.close(); userModal.open();}}>Hi {auth.user.username}</span>
                    <CloseButton onClick={drawer.close}/>
                </div> 
                <div className={sty.menu}>
                    <MenuOption currentRoute={auth.route} icon={<IconPhoto size={23}/>} text={'Pictures'} hrefRoute={'dashboard'}/>
                    <MenuOption currentRoute={auth.route} icon={<IconUpload />} text={'Upload pictures'} hrefRoute={'upload'}/>
                </div>
            </Drawer>

            <nav className={sty.nav}>
                <div className={sty.logo}>
                    <Logo size={50}/>
                    <Text>Picuss</Text>
                </div>

                <Burger opened={openedDrawer} onClick={drawer.toggle} aria-label="Toggle navigation" />
            </nav>

            {children}
        </>
    )
}
