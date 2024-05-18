import React, { useEffect, useState } from 'react'
import sty from '../../../../scss/DeleteConfirmModel.module.scss';
import { Button, Transition } from '@mantine/core';
import { IconClick, IconError404, IconFileMinus, IconTrash } from '@tabler/icons-react';
import axios from 'axios';
import showNotification from '../../Functions/showNotification';

export default function DeleteConfirmModal({ opened, close, selectedTags = [], setTagsAndClose }) {
    const [modalOpened, setModalOpened] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    function onDeleteHandler() {
        if (!confirm) {
            setConfirm(true);
            return ;
        }

        // Deletion has been confirmed
        setLoading(true);
        axios.delete(route('tags.delete'), { data: { tags: selectedTags } })
            .then(res => {
                showNotification({
                    message: res.data.message,
                    title: 'Success',
                    icon: <IconFileMinus strokeWidth={1.25}/>
                });

                
                setTagsAndClose(res.data.tags);
                setLoading(false);
            })
            .catch(err => {
                showNotification({
                    message: err.response.data.message,
                    title: `${err.response.statusText} - ${err.response.status}`,
                    color: 'red',
                    icon: <IconError404 strokeWidth={1.25}/>
                });
            })
            .finally(() => { setLoading(false); });

        
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
                                            {(selectedTags.length === 0) 
                                                ? <IconClick size={36}/>
                                                : <IconTrash size={36}/>
                                            }
                                            
                                        </div>
                                    </div>

                                    <div className={sty.content}>
                                        {(selectedTags.length !== 0) 
                                            ? 
                                            <>
                                                <p className={sty.label}>Delete {(selectedTags.length === 1) ? 'Tag' : 'Tags'}</p>
                                                <p className={sty.description}>Are you sure you want to delete <b style={{ color: 'var(--mantine-color-red-text)' }}>{selectedTags.length}</b> {(selectedTags.length === 1) ? 'tag' : 'tags'}? If you delete these tags, pictures that belong to them will get deleted aswell</p>
                                            </>
                                            : 
                                            <>
                                                <p className={sty.label}>Select Tags</p>
                                                <p className={sty.description}>Before deleting any tags, you need to choose which tags you want to delete. You can do that by selecting tags in the list</p>
                                            </>
                                        }
                                    </div>
                                </div>

                                
                                <div className={sty.footer}>
                                    {selectedTags.length !== 0 &&
                                        <Button 
                                            onClick={onDeleteHandler} 
                                            variant={(confirm) ? 'outline' : 'light'} 
                                            color='red' 
                                            loading={loading}
                                        >{(confirm) ? 'Are you sure?' : 'Delete tags'}</Button>
                                    }

                                    <Button disabled={loading} onClick={close} variant={(selectedTags.length === 0) ? 'light' : 'subtle'} color='red'>{(selectedTags.length === 0) ? 'Go back' : 'Cancel'}</Button>
                                    
                                </div>
                            </div>
                        }
                    </Transition>
                </div>
            }
        </Transition>   
    )
}
