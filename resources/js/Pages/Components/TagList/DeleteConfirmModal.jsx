import React, { useEffect, useState } from 'react'
import sty from '../../../../scss/DeleteConfirmModel.module.scss';
import { Text, Transition } from '@mantine/core';
export default function DeleteConfirmModal({ opened, close, title = 'Confirmation' }) {
    const [modalOpened, setModalOpened] = useState(false);
    
    useEffect(() => {
        if (opened) {
            setTimeout(() => setModalOpened(true), 100);
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

                <div style={styles} onClick={close} className={sty.overlay}>
                    <Transition
                        mounted={modalOpened}
                        transition={'fade-down'}
                        duration={300}
                    >
                        {(styles) => 
                            <div style={styles} className={sty.modal}>
                                <div className={sty.nav}>
                                    <Text c={'red'}>{title}</Text>
                                </div>
                            </div>
                        }
                    </Transition>
                </div>
            }
        </Transition>   
    )
}
