import React, { useEffect, useState } from "react";
import sty from "../../../../scss/TagList.module.scss";
import TagMenu from "./TagMenu";
import { IconPhoto, IconTag, IconWind } from "@tabler/icons-react";
import { Checkbox, Flex, Text, Transition } from "@mantine/core";
import CheckTag from "./CheckTag";
import capitalizeFirstLetter from "../../Functions/capitalizeFirstLetter";
import removeArrValue from "../../Functions/removeArrValue";

export default function TagList({ tags, search, setTags }) {
    const [selectedTags, setSelectedTags] = useState([]);

    const empty_list_children = (
        <>
            <div className={sty.tag_container_empty}>
                <IconWind
                    style={{ opacity: 0.9 }}
                    color="var(--mantine-primary-color-filled-hover)"
                    size={"20%"}
                    stroke={1.25}
                />
                <Text className={sty.main}>NO TAGS FOUND</Text>
                <Text className={sty.desc}>You must have blown them away</Text>
            </div>
        </>
    );

    const iconProps = {
        color: "var(--mantine-color-placeholder)",
        size: 20,
        strokeWidth: 1.25,
    };

    function checkboxCheckHandler(tagId) {
        if (selectedTags.includes(tagId)) {
            // if array includes the tag, that means tag is already selected
            setSelectedTags(removeArrValue([...selectedTags], tagId));
        } else {
            // tag is not selected
            setSelectedTags([...selectedTags, tagId]);
        }
    }

    function selectAllHandler(e) {
        if (e.target.checked) {
            setSelectedTags([...tags.map((tag) => tag.id)]);
        } else {
            setSelectedTags([]);
        }
    }

    useEffect(() => {
        setSelectedTags([]);
    }, [tags]);

    return (
        <div className={sty.container}>
            <div className={sty.head}>
                <TagMenu
                    selectedTags={selectedTags}
                    setTags={(tags) => setTags(tags)}
                />
                <span className={sty.selected}>
                    {selectedTags.length}{" "}
                    {selectedTags.length === 1 ? "tag" : "tags"} selected
                </span>
            </div>
            <div className={sty.table_headers}>
                <Flex align={"center"} gap={8}>
                    <Checkbox
                        indeterminate={selectedTags.length === tags.length}
                        onChange={(e) => selectAllHandler(e)}
                        checked={selectedTags.length === tags.length}
                    />
                    <Flex align={"center"} gap={4}>
                        <IconTag {...iconProps} />
                        <Text fw={"bold"}>Tag name</Text>
                    </Flex>
                </Flex>

                <Flex align={"center"} gap={4}>
                    <IconPhoto {...iconProps} />
                    <Text fw={"bold"}>Pictures</Text>
                </Flex>
            </div>
            <div className={sty.tag_container}>
                <Transition
                    mounted={search}
                    transition={"fade"}
                    duration={150}
                    timingFunction="ease-out"
                >
                    {(styles) => (
                        <div style={styles} className={sty.create_msg}>
                            <IconTag
                                color="var(--mantine-primary-color-filled-hover)"
                                size={36}
                                strokeWidth={1.25}
                            />
                            <div>
                                <Text>
                                    Create "{capitalizeFirstLetter(search)}" tag
                                </Text>
                                <Text c={"dimmed"} size="sm">
                                    Press enter or send to create new tag
                                </Text>
                            </div>
                        </div>
                    )}
                </Transition>

                {tags.length === 0 ? (
                    empty_list_children
                ) : (
                    <div>
                        {tags.map((tag) => {
                            if (
                                search === "" ||
                                tag.name
                                    .toLowerCase()
                                    .includes(search.toLowerCase())
                            ) {
                                return (
                                    <CheckTag
                                        key={tag.name}
                                        name={capitalizeFirstLetter(tag.name)}
                                        pictureCount={tag.pictureCount}
                                        id={tag.id}
                                        onChange={checkboxCheckHandler}
                                        checked={selectedTags.includes(tag.id)}
                                        setTags={setTags}
                                    />
                                );
                            }
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
