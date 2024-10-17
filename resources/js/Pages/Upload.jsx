import React, { useEffect, useRef, useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import { Button, Checkbox, Container, Flex, Paper, Progress, Transition } from "@mantine/core";

// ------ for file dropping ------
import { Group, Text, rem } from "@mantine/core";
import {
    IconUpload,
    IconPhoto,
    IconX,
    IconTags,
    IconDownload,
    IconClearAll,
    IconBug,
    IconCloud,
    IconCloudOff,
} from "@tabler/icons-react";
import { Dropzone } from "@mantine/dropzone";
// -------------------------------

import sty from "../../scss/upload.module.scss";
import { imageCompressor } from "@mbs-dev/react-image-compressor";
import SelectCreatableTags from "./Components/SelectCreatableTags";
import TagPill from "./Components/TagPill";
import { handleZip } from "./Functions/handleZip";
import UploadImagePreview from "./Components/UploadImagePreview";
import axios from "axios";
import showNotification from "./Functions/showNotification";
import TitleWithIcon from "./Components/TitleWithIcon";
import Title from "./Components/Title";

export default function Upload({ auth, title = "", used_space = null }) {
    const [compress, setCompress] = useState(true);
    const [compressing, setCompressing] = useState(false);
    const [compressingProgress, setCompressingProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    // Modify variables
    const [compressArr, setCompressArr] = useState([]);
    const [uploadArr, setUploadArr] = useState([]);

    const [uploadSize, setUploadSize] = useState({
        compressedSize: 0,
        unCompressedSize: 0,
    });
    const [selectedTags, setSelectedTags] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [leftMBs, setLeftMBs] = useState(null);

    function dropHandler(files) {
        /*
            We need need to count uncompressed file size, so we can compare how much
            data we have saved
        */
        let oldSize = 0; // old file size
        for (const file of files) {
            oldSize += file.size;
        }

        setUploadSize({
            ...uploadSize,
            unCompressedSize: uploadSize.unCompressedSize + Math.round((oldSize / 1024 ** 2) * 100) / 100,
        });

        if (compress) {
            setCompressing(true);
            setCompressArr(files); // useEffect is watching this array
        } else {
            setUploadArr([...uploadArr, ...files]);
        }
    }

    // Handle pasting images
    useEffect(() => {
        const handlePaste = (e) => {
            const items = e.clipboardData.items;
            let blobs = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();

                    console.log(blob);
                    blobs.push(blob);
                }
            }

            if (blobs.length !== 0) {
                dropHandler(blobs); // Pass the image blob to your function
            }
        };

        // Calculate left MB
        if (auth.user.limit !== undefined && auth.user.limit !== null && auth.user.limit !== 0) {
            // Auth.user.limit is in GB
            let mbLeft = auth.user.limit * 1024 - used_space;
            setLeftMBs(Math.round(mbLeft * 100) / 100);
        }

        window.addEventListener("paste", handlePaste);

        return () => window.removeEventListener("paste", handlePaste);
    }, []);

    async function compressHandler() {
        let tmp = [];

        for (const x of compressArr) {
            // Deciding on compression quality happens automatically
            /*
                If image size is below 200KB, we do not need to compress it
                if it is between 200KB and 4MB, we need to compress it 80%
                if it is above 4MB, we need to compress it 20%

                TODO: Check if bigger images need more compression
            */

            const fileSize = x.size / 1024; // Get file size in kiloBytes
            let imageQuality = 0;

            switch (true) {
                case fileSize > 6000:
                    imageQuality = 20;
                    break;
                case fileSize > 4000:
                    imageQuality = 30;
                    break;
                case fileSize > 2000:
                    imageQuality = 50;
                    break;
                case fileSize > 1000:
                    imageQuality = 80;
                    break;
                default:
                    break;
            }

            // console.log(`Compressing: ${x.name} (${fileSize}KB) - ${imageQuality}%`);

            let compressedImage = x;
            // Compress the image only if compression is needed for an image (Obove 0 image quality)
            if (imageQuality !== 0) {
                compressedImage = await imageCompressor(x, imageQuality / 100);
            }

            tmp.push(compressedImage);

            // Update the progress bar
            setCompressingProgress(Math.round(((tmp.length * 10) / compressArr.length) * 100) / 10);
        }

        setUploadArr([...uploadArr, ...tmp]);
        setCompressing(false);
        setCompressArr([]);
        setCompressingProgress(0);
    }

    function removeImageHandler(idx) {
        // making hard copy so the useState notices the change
        let tmp = [...uploadArr];
        tmp.splice(idx, 1);
        setUploadArr(tmp);
    }

    function removeTagHandler(idx) {
        // making hard copy so the useState notices the change
        let tmp = [...selectedTags];
        tmp.splice(idx, 1);
        setSelectedTags(tmp);
    }

    // Add selected tag and display it with useState
    // And check if it already is displayed, add if not
    function addTagHandler(tag) {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    function uploadHandler() {
        if (uploadSize.compressedSize > leftMBs) {
            showNotification({
                title: "Exceeded limit",
                icon: <IconCloud color="var(--mantine-color-text)" {...iconProps} size={20} />,
                color: "red",
            });
            return;
        }
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
            data.append("zip", zipFile);

            // Convert selected tags, to array of tag ids
            const tagIds = selectedTags.map((tag) => tag.id);
            data.append("tags", JSON.stringify(tagIds));

            // reset variables
            setUploadArr([]);
            setUploadSize({ compressedSize: 0, unCompressedSize: 0 });

            axios
                .post(route("upload.post"), data, {
                    // config
                    headers: {
                        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
                    },
                    onUploadProgress: (data) => {
                        //Set the progress value to show the progress bar
                        setUploadProgress(Math.round((100 * data.loaded) / data.total));
                    },
                })
                .then((res) => {
                    // console.log('Response:',res.data);
                    // show good notification
                    showNotification({
                        message: res.data.message,
                        title: "Success",
                    });
                })
                .catch((err) => {
                    console.error(err);

                    showNotification({
                        message: err.response.data.message,
                        title: `${err.response.statusText} - ${err.response.status}`,
                        color: "red",
                        icon: <IconBug strokeWidth={1.25} />,
                    });
                })
                .finally((res) => {
                    setSelectedTags([]);
                    setUploading(false);
                    setUploadProgress(0);
                });
        });
    }

    function handleCancel() {
        setCompress(true);
        setCompressing(false);
        setCompressingProgress(0);
        setUploading(false);
        setCompressArr([]);
        setUploadArr([]);
        setUploadSize({
            compressedSize: 0,
            unCompressedSize: 0,
        });
        setSelectedTags([]);
        setUploadProgress(0);
    }

    useEffect(() => {
        if (uploadArr.length === 0) {
            setUploadSize({ compressedSize: 0, unCompressedSize: 0 });
            return;
        }

        let size = 0;
        uploadArr.forEach((x) => (size += x.size));
        setUploadSize({
            ...uploadSize,
            compressedSize: Math.round((size / 1024 ** 2) * 100) / 100,
        });
    }, [uploadArr]);

    useEffect(() => {
        if (compressArr.length !== 0) {
            compressHandler();
        }
    }, [compressArr]);

    const previousUploadSize = useRef(0);
    function showLimitExceeded() {
        if (auth.user.limit === null) {
            return;
        }

        if (previousUploadSize.current < uploadSize.compressedSize) {
            showNotification({
                title: "Exceeded limit",
                message: `You have exceeded the limit of ${leftMBs} MB. You need to remove ${Math.round((uploadSize.compressedSize - leftMBs) * 100) / 100} MB of images`,
                icon: <IconCloud color="var(--mantine-color-text)" {...iconProps} size={20} />,
                color: "red",
            });
        }
        previousUploadSize.current = uploadSize.compressedSize;
    }

    useEffect(() => {
        if (uploadSize.compressedSize === 0) {
            return;
        }

        if (leftMBs < uploadSize.compressedSize) {
            showLimitExceeded();
        }
    }, [uploadSize]);

    const iconProps = {
        size: 20,
        strokeWidth: 1.25,
    };

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
            <Container size={"md"} py={"md"}>
                <TitleWithIcon
                    title="Upload pictures"
                    order={3}
                    icon={<IconUpload size={28} strokeWidth={1.5} />}
                    my={16}
                    rightSection={{
                        element: leftMBs && (
                            <Flex mx={16} gap={8} align="center">
                                <IconCloud color={"var(--mantine-color-text)"} {...iconProps} size={20} />
                                <Text c={"var(--mantine-color-text)"}>
                                    {leftMBs > 1024 ? Math.round((leftMBs / 1024) * 100) / 100 : leftMBs}{" "}
                                    {leftMBs > 1024 ? "GB" : "MB"} left
                                </Text>
                            </Flex>
                        ),
                        alignLeft: true,
                    }}
                />
                <Dropzone
                    loading={compressing}
                    disabled={uploading}
                    mt={16}
                    onDrop={(files) => dropHandler(files)}
                    onReject={(files) => console.log("rejected files", files)}
                    maxSize={20 * 1024 ** 2}
                    accept={{
                        "image/*": [], // All images
                    }}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
                        <Dropzone.Accept>
                            <IconUpload
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-blue-6)",
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-red-6)",
                                }}
                                stroke={1.5}
                            />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto
                                style={{
                                    width: rem(52),
                                    height: rem(52),
                                    color: "var(--mantine-color-dimmed)",
                                }}
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

                <Paper my={16} withBorder p={"sm"}>
                    <Checkbox
                        disabled={compressing}
                        checked={compress}
                        onChange={(e) => setCompress(!compress)}
                        label="Compress pictures before upload"
                    />

                    <Transition mounted={compressing} transition="fade-down" duration={250} timingFunction="ease">
                        {(styles) => (
                            <Flex style={styles} mt={8} gap={16} align={"center"}>
                                <Text>{compressingProgress}%</Text>
                                <Progress w={"100%"} value={compressingProgress} animated />
                            </Flex>
                        )}
                    </Transition>
                </Paper>

                {uploadArr.length !== 0 && (
                    <Paper mt={16} withBorder p={"xs"}>
                        <Flex gap={8} align={"center"} justify={"space-between"} my={8}>
                            <Text>
                                {uploadArr.length} pictures with the size of{" "}
                                <b
                                    style={{
                                        color: "var(--mantine-primary-color-8)",
                                    }}
                                >
                                    {uploadSize.compressedSize} MB{" "}
                                </b>
                                saved{" "}
                                <b
                                    style={{
                                        color: "var(--mantine-primary-color-8)",
                                    }}
                                >
                                    {" "}
                                    {Math.round((uploadSize.unCompressedSize - uploadSize.compressedSize) * 100) /
                                        100}{" "}
                                    MB
                                </b>
                            </Text>
                            <Button
                                onClick={() => handleZip({ images: uploadArr })}
                                size="xs"
                                variant="light"
                                leftSection={<IconDownload size={20} />}
                            >
                                Download ZIP
                            </Button>
                        </Flex>

                        <div className={sty.photos}>
                            {uploadArr.map((x, i) => {
                                return (
                                    <UploadImagePreview key={x.name} blob={x} onRemove={() => removeImageHandler(i)} />
                                );
                            })}
                        </div>
                    </Paper>
                )}

                {uploadArr.length !== 0 && (
                    <Paper withBorder mt={16} p={"xs"} mb={16}>
                        <Flex align={"center"} gap={8} mb={16}>
                            <IconTags size={28} color="var(--mantine-primary-color-8)" />
                            <Text mt={4}>Select picture tags</Text>
                        </Flex>

                        <SelectCreatableTags select={(tag_array) => addTagHandler(tag_array)} />

                        {selectedTags.length !== 0 && (
                            <Paper withBorder mt={8} p={"sm"}>
                                <Flex gap={8} wrap={"wrap"}>
                                    {selectedTags.map((tag, idx) => (
                                        <TagPill key={tag.name} remove={() => removeTagHandler(idx)} name={tag.name} />
                                    ))}
                                </Flex>
                            </Paper>
                        )}
                    </Paper>
                )}

                <Flex mb={128} gap={8} align={"center"}>
                    <Button
                        loading={uploading}
                        onClick={uploadHandler}
                        leftSection={
                            uploadSize.compressedSize > leftMBs ? (
                                <IconCloudOff {...iconProps} />
                            ) : (
                                <IconUpload {...iconProps} />
                            )
                        }
                        disabled={selectedTags.length == 0}
                        color={uploadSize.compressedSize > leftMBs ? "red" : ""}
                    >
                        Upload
                    </Button>
                    <Button
                        disabled={uploading}
                        leftSection={<IconClearAll {...iconProps} />}
                        variant="default"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>

                    <Text c={"dimmed"} ml={16}>
                        {uploadProgress}%
                    </Text>
                    <Progress value={uploadProgress} flex={"1"} animated />
                </Flex>
            </Container>
        </AuthLayout>
    );
}
