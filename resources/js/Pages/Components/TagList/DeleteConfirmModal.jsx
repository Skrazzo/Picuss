import React, { useEffect, useState } from 'react'
import sty from '../../../../scss/DeleteConfirmModel.module.scss';
import { Alert, Button, Checkbox, CloseButton, Fieldset, Flex, Paper, Switch, Text, Transition } from '@mantine/core';
import { IconInfoCircle, IconTrash } from '@tabler/icons-react';
export default function DeleteConfirmModal({ opened, close, tags = [] }) {
    const [modalOpened, setModalOpened] = useState(false);
    const [confirm, setConfirm] = useState(false);

    function onDeleteHandler() {
        if (!confirm) {
            setConfirm(true);
            return ;
        }

        // Deletion has been confirmed
        console.log(tags);
    }
    
    useEffect(() => {
        if (opened) {
            setTimeout(() => setModalOpened(true), 100);
            setConfirm(false);
        }else{
            setModalOpened(false);
        }
    }, [opened]);
    
    return (
        <Transition 
            mounted={opened}
            transition={'fade'}
            duration={400}
        >
            {(styles) =>

                <div style={styles} className={sty.overlay}>
                    <Transition
                        mounted={modalOpened}
                        transition={'pop'}
                        duration={200}
                    >
                        {(styles) => 
                            <div style={styles} className={sty.modal}>
                                <div className={sty.nav}>
                                    <div>
                                        <div className={sty.icon}>
                                            <IconTrash size={36}/>
                                        </div>
                                    </div>

                                    <div className={sty.content}>
                                        <p className={sty.label}>Delete Tags</p>
                                        <p className={sty.description}>Are you sure you want to delete these tags? If you delete these tags, pictures that belong to them will get deleted aswell</p>
                                    </div>
                                </div>

                                <div className={sty.footer}>
                                    <Button 
                                        onClick={onDeleteHandler} 
                                        variant={(confirm) ? 'outline' : 'light'} 
                                        color='red' 
                                    >{(confirm) ? 'Are you sure?' : 'Delete tags'}</Button>

                                    <Button onClick={close} variant={'subtle'} color='red'>Cancel</Button>
                                    
                                </div>
                            </div>
                        }
                    </Transition>
                </div>
            }
        </Transition>   
    )
}
