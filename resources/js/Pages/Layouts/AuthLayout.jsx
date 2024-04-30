import React, { Children, useEffect, useState } from 'react'
import Logo from '../Components/Logo';
import sty from '../../../scss/authLayout.module.scss';
import { Burger, Button, CloseButton, Drawer, Modal, SimpleGrid, Skeleton, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MenuOption from '../Components/MenuOption';
import { IconLogout2, IconPhoto, IconTag, IconTags, IconUpload, IconUser } from '@tabler/icons-react';
import DisabledInputInfo from '../Components/DisabledInputInfo';
import axios from 'axios';
import { Link } from '@inertiajs/inertia-react';

export default function AuthLayout({ auth, children }) {
    const [openedDrawer, drawer] = useDisclosure();
    const [openedUserModal, userModal] = useDisclosure();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if(openedUserModal){
            axios.get(route('user.modal.info')).then((res) => {
                setUserInfo(res.data);
                console.log(res.data);
            }).catch((err) => {
                alert("Error has appeared! Please check the console!");
                console.error(err);
            });

        }
    }, [openedUserModal]);

    return (
        <>
            <Modal opened={openedUserModal} onClose={userModal.close} title={auth.user.username}>
                <SimpleGrid cols={2} spacing={'sm'} verticalSpacing={'sm'}>

                    {(userInfo) ?
                        <>
                            <DisabledInputInfo tooltip={'Total pictures uploaded'} icon={<IconPhoto />} value={userInfo.pictures}/>
                            <DisabledInputInfo tooltip={'Total tags made'} icon={<IconTags />} value={userInfo.tags}/>
                            <DisabledInputInfo tooltip={'Last picture was uploaded'} icon={<IconUpload />} value={userInfo.last_picture_uploaded}/>
                            <DisabledInputInfo tooltip={'Last tag was made'} icon={<IconTag />} value={userInfo.last_tag_created}/>
                            <DisabledInputInfo tooltip={'You created your account'} icon={<IconUser />} value={userInfo.user_created}/>
                        </>
                        :
                        <>
                            <Skeleton w={'100%'} h={30}/>
                            <Skeleton w={'100%'} h={30}/>
                            <Skeleton w={'100%'} h={30}/>
                            <Skeleton w={'100%'} h={30}/>
                            <Skeleton w={'100%'} h={30}/>
                        </>
                    }
                </SimpleGrid>
                
                <Link href={route('logout')}>
                    <Button onClick={() => setUserInfo(null)} loading={!userInfo} mt={'sm'} leftSection={<IconLogout2 size={19}/>} size='xs' color='red'>Logout</Button>
                </Link>
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
