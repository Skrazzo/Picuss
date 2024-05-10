import React, { useEffect, useState } from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Button, Checkbox, Container, Flex, Paper, Progress, Slider, Transition } from '@mantine/core'

// ------ for file dropping ------
import { Group, Text, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconTags, IconDownload, IconClearAll, IconBug } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
// -------------------------------

import sty from '../../scss/upload.module.scss';
import {compressAndAppendImage, imageCompressor} from '@mbs-dev/react-image-compressor';
import SelectCreatableTags from './Components/SelectCreatableTags';
import TagPill from './Components/TagPill';
import { handleZip } from './Functions/handleZip';
import UploadImagePreview from './Components/UploadImagePreview';
import axios from 'axios';
import showNotification from './Functions/showNotification';

export default function Upload({ auth }) {
    const [compress, setCompress] = useState(true);
    const [compressing, setCompressing] = useState(false);
    const [compressingProgress, setCompressingProgress] = useState(0);
    const [imageQuality, setImageQuality] = useState(20);
    const [uploading, setUploading] = useState(false);
    
    // Modify variables    
    const [compressArr, setCompressArr] = useState([]);
    const [uploadArr, setUploadArr] = useState([]);

    const [uploadSize, setUploadSize] = useState({ compressedSize: 0, unCompressedSize: 0 });
    const [selectedTags, setSelectedTags] = useState([]);

    function dropHandler(files){
        /*
            We need need to count uncompressed file size, so we can compare how much
            data we have saved
        */
        let oldSize = 0; // old file size
        for (const file of files){
            oldSize += file.size;
        }

        setUploadSize({ ...uploadSize, unCompressedSize: uploadSize.unCompressedSize + Math.round(oldSize / 1024 ** 2 * 100) / 100 });

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
            // console.log('compressing',x.name);
            
            const compressedImage = await imageCompressor(x, imageQuality / 100);
            tmp.push(compressedImage);
            setCompressingProgress(Math.round((tmp.length * 10) / compressArr.length * 100) / 10);
        }
        
        setUploadArr([...uploadArr, ...tmp]);
        setCompressing(false);
        setCompressArr([]);
        setCompressingProgress(0);
    }

    function removeImageHandler(idx){
        // making hard copy so the useState notices the change
        let tmp = [...uploadArr]; 
        tmp.splice(idx, 1);
        setUploadArr(tmp);
    }

    function removeTagHandler(idx){
        // making hard copy so the useState notices the change
        let tmp = [...selectedTags]; 
        tmp.splice(idx, 1);
        setSelectedTags(tmp);
    }

    // Add selected tag and display it with useState
    // And check if it already is displayed, add if not
    function addTagHandler(tag){
        if (!selectedTags.includes(tag)){
            setSelectedTags([...selectedTags, tag]);
        }
    }

    function uploadHandler() {
        /*  
            We need to create zip file with all compressed pictures
            put tags into form data
            put zip file into form data
            upload it to laravel
        */

        setUploading(true);
        
        handleZip({ images: uploadArr, download: false }).then((zipFile) => {
            // After zipping files, upload them to the cloud
            // We are using FormData, because we cannot send blob otherwise with axios
            const data = new FormData();
            data.append('zip', zipFile);
            data.append('tags', JSON.stringify(selectedTags));
            
            // reset variables
            setUploadArr([]);
            setUploadSize({ compressedSize: 0, unCompressedSize: 0 });
    
            axios.post(route('upload.post'), data ,
            { // config
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                }
            })
            .then(res => {
                console.log('Response:',res.data);
            })
            .catch(err => {
                console.error(err);

                showNotification({ 
                    message: err.response.data.message,
                    title: `${err.response.statusText} - ${err.response.status}`,
                    color: 'red',
                    icon: <IconBug strokeWidth={1.25}/>
                });
            })
            .finally(() => {
                setSelectedTags([]);
                setUploading(false);
            });
        });
    }

    useEffect(() => console.log('upload arr', uploadArr), [uploadArr]);
    
    useEffect(() => {
        if (uploadArr.length === 0) {
            setUploadSize({ compressedSize: 0, unCompressedSize: 0 });
            return;
        }

        let size = 0;
        uploadArr.forEach(x => size += x.size);
        setUploadSize({...uploadSize,  compressedSize: Math.round(size / 1024 ** 2 * 100) / 100 });
        
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
                    disabled={uploading}
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

                   
                    {compress &&
                        <Slider max={80} w={'100%'} mt={8} disabled={compressing} value={imageQuality} onChange={setImageQuality} label={(value) => `Image quality: ${value} %`}/>
                    }    
                        
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
                    <Paper mt={16} withBorder p={'xs'} >
                        <Flex gap={8} align={'center'} justify={'space-between'} my={8}>
                            <Text>
                                {uploadArr.length} pictures with the size of <b style={{ color: 'var(--mantine-primary-color-8)' }}>{uploadSize.compressedSize} MB </b> 
                                saved <b style={{ color: 'var(--mantine-primary-color-8)' }}> {Math.round((uploadSize.unCompressedSize - uploadSize.compressedSize) * 100) / 100} MB</b>
                            </Text>
                            <Button onClick={() => handleZip({ images: uploadArr })} size='xs' variant='light' leftSection={<IconDownload size={20}/>}>Download ZIP</Button>
                        </Flex>

                        <div className={sty.photos}>
                            {uploadArr.map((x, i) => {
                                return (
                                    <UploadImagePreview key={x.name} blob={x} onRemove={() => removeImageHandler(i)}/>
                                );
                                
                            })}
                        </div>
                    </Paper>
                }

                
                {uploadArr.length !== 0 &&
                    <Paper withBorder mt={16} p={'xs'} mb={16}>
                        <Flex align={'center'} gap={8} mb={16}>
                            <IconTags size={28} color='var(--mantine-primary-color-8)'/>
                            <Text mt={4}>Select picture tags</Text>

                        </Flex>

                        <SelectCreatableTags select={(tag_array) => addTagHandler(tag_array)}/>

                        {selectedTags.length !== 0 &&
                            <Paper withBorder mt={8} p={'sm'}>
                                <Flex gap={8} wrap={'wrap'}>
                                    {selectedTags.map((tag, idx) => 
                                        <TagPill key={tag.name} remove={() => removeTagHandler(idx)} name={tag.name}/>
                                    )}
                                </Flex>
                            </Paper>
                        }
                    </Paper>
                }

                {selectedTags.length !== 0 &&
                    <Flex mb={128} gap={8}>
                        <Button loading={uploading} onClick={uploadHandler} leftSection={<IconUpload />} >Upload</Button>
                        <Button disabled={uploading} leftSection={<IconClearAll />} variant='subtle'>Cancel</Button>
                    </Flex>
                }
                
                    
            </Container>
        </AuthLayout>
    )
}
