import React, { useEffect, useState } from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Checkbox, Container, Flex, Paper, Progress, Transition } from '@mantine/core'

// ------ for file dropping ------
import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconPhotoX } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
// -------------------------------

import sty from '../../scss/upload.module.scss';
import {compressAndAppendImage, imageCompressor} from '@mbs-dev/react-image-compressor';

export default function Upload({ auth }) {
    const [compress, setCompress] = useState(true);
    const [compressing, setCompressing] = useState(false);
    const [compressingProgress, setCompressingProgress] = useState(0);
    const [compressArr, setCompressArr] = useState([]);
    const [uploadArr, setUploadArr] = useState([]);

    const [uploadSize, setUploadSize] = useState(0);

    function dropHandler(files){
        if (compress){ 
            setCompressing(true);
            setCompressArr(files); // useEffect is watching this array
        }else{
            setUploadArr([...uploadArr, ...files]);
        }
    }

    async function compressHandler(){
        let tmp = [];

        for (const x of compressArr){
            console.log('compressing',x.name);
            const compressedImage = await imageCompressor(x, 0.2);
            tmp.push(compressedImage);

            setCompressingProgress(Math.round((tmp.length * 100) / compressArr.length * 100) / 100);
        }
        
        setUploadArr([...uploadArr, ...tmp]);
        setCompressing(false);
        setCompressArr([]);
        setCompressingProgress(0);
    }

    useEffect(() => console.log(uploadArr), [uploadArr]);
    
    useEffect(() => {
        let size = 0;
        uploadArr.forEach(x => size += x.size);
        setUploadSize(Math.round(size / 1024 ** 2 * 100) / 100);
        
    }, [uploadArr]);

    useEffect(() => {
        if (compressArr.length !== 0){
            compressHandler();
        }
    }, [compressArr]);

    return (
        <AuthLayout auth={auth}>
            <Container size={'md'} py={'md'} >
                <Dropzone
                    loading={compressing}
                    mt={16}
                    onDrop={(files) => dropHandler(files)}
                    onReject={(files) => console.log('rejected files', files)}
                    maxSize={20 * 1024 ** 2}
                    accept={{
                        'image/*': [], // All images
                    }}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto
                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                stroke={1.5}
                            />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Drag images here or click to select files
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Attach as many files as you like, each file should not exceed 20mb
                            </Text>
                        </div>
                    </Group>
                </Dropzone>

                <Paper my={16} withBorder p={'sm'}>
                    <Checkbox
                        disabled={compressing}
                        checked={compress}
                        onChange={(e) => setCompress(!compress)}
                        label="Compress my pictures before upload"
                    />


                    <Transition
                        mounted={compressing}
                        transition="fade-down"
                        duration={250}
                        timingFunction="ease"
                    >
                        {(styles) => 
                            <Flex style={styles} mt={8} gap={16} align={'center'}>
                                <Text>{compressingProgress}%</Text>
                                <Progress w={'100%'} value={compressingProgress} animated/>
                            </Flex>
                        }
                    </Transition> 
                </Paper>
                
                

                {uploadArr.length !== 0 &&
                    <Paper mt={32} shadow='xs' p={'xs'} >
                        <Text my={8}>{uploadArr.length} pictures with the size of <b style={{ color: 'var(--mantine-primary-color-8)' }}>{uploadSize} MB</b></Text>
                        
                        <div className={sty.photos}>
                            {uploadArr.map((x, i) => {
                                return (
                                    <div key={i} className={sty.photo_container}>
                                        <div className={sty.overlay}>
                                            <div className={sty.circle}><IconPhotoX size={30}/></div>
                                            <span>Remove picture</span>
                                        </div>
                                        <img src={URL.createObjectURL(x)} />
                                    </div>
                                );
                            })}
                        </div>
                    </Paper>
                }

            </Container>
        </AuthLayout>
    )
}
