import React, { useEffect, useState } from "react";
import sty from "../../../scss/PictureViewer.module.scss";
import {
    ActionIcon,
    Button,
    Checkbox,
    Paper,
    Table,
    Text,
} from "@mantine/core";
import {
    IconBan,
    IconChevronLeft,
    IconChevronRight,
    IconDeviceFloppy,
    IconDotsVertical,
    IconFileInfo,
    IconTags,
} from "@tabler/icons-react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";

export default function PictureViewer({ selected, setSelected, images, tags }) {
    if (!selected) return <></>;

    // Find image and recheck if it exists
    const image = images.filter((x) => x.id === selected)[0] || {};
    if (!("id" in image)) return <></>;

    // Use states
    const [selectedTags, setSelectedTags] = useState(image.tags);

    console.log(image);
    console.log(tags);
    console.log(selectedTags);

    const SectionTitle = ({ text, icon, rightSection = <></> }) => (
        <div className={sty.section_title}>
            <div>
                {icon}
                <Text>{text}</Text>
            </div>
            {rightSection}
        </div>
    );

    const fileInfo = [
        ["Size", `${image.size} MB`],
        ["Upload Date", image.uploaded],
        ["Uploaded", image.uploaded_ago],
    ];

    const fileInfoRows = fileInfo.map((row) => (
        <Table.Tr>
            <Table.Td>{row[0]}</Table.Td>
            <Table.Td>{row[1]}</Table.Td>
        </Table.Tr>
    ));

    function tagHandler(id) {
        if (selectedTags.includes(id)) {
            setSelectedTags(selectedTags.filter((tag) => tag !== id));
        } else {
            setSelectedTags([...selectedTags, id]);
        }
    }

    return (
        <div className={sty.container}>
            <div className={sty.side}>
                <div>
                    <div className={sty.title}>
                        <Text
                            size={"20px"}
                            fw={600}
                            className={`${sty.green_text}`}
                        >
                            {image.name}
                        </Text>

                        <ActionIcon variant="subtle">
                            <IconDotsVertical />
                        </ActionIcon>
                    </div>

                    <SectionTitle text={"File"} icon={<IconFileInfo />} />
                    <div className={sty.info_container}>
                        <Table>
                            <Table.Tbody>{fileInfoRows}</Table.Tbody>
                        </Table>
                    </div>

                    <SectionTitle
                        text={"Tags"}
                        icon={<IconTags />}
                        rightSection={
                            <ActionIcon variant="subtle">
                                {selectedTags.length === 0 ? (
                                    <IconBan />
                                ) : (
                                    <IconDeviceFloppy />
                                )}
                            </ActionIcon>
                        }
                    />
                    <div className={sty.info_container}>
                        <Paper
                            p={"0.5rem"}
                            withBorder
                            className={sty.checkboxes}
                        >
                            {tags.map((tag, idx) => (
                                <Checkbox
                                    size="18px"
                                    key={idx}
                                    mt={idx === 0 ? 0 : 8}
                                    onChange={() => tagHandler(tag.id)}
                                    defaultChecked={selectedTags.includes(
                                        tag.id
                                    )}
                                    label={capitalizeFirstLetter(tag.name)}
                                />
                            ))}
                        </Paper>
                    </div>
                </div>

                <div className={sty.buttons}>
                    <Button variant="default" leftSection={<IconChevronLeft />}>
                        Previous
                    </Button>
                    <Button
                        variant="default"
                        rightSection={<IconChevronRight />}
                    >
                        Next
                    </Button>
                </div>
            </div>
            Picture viewer
        </div>
    );
}
