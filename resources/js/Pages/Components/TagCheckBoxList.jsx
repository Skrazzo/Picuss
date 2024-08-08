import { Checkbox, Flex, Input, Paper, Skeleton, Text } from "@mantine/core";
import React, { useState } from "react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";
import { IconTagOff, IconTagsOff } from "@tabler/icons-react";

const Layout = ({ children, style, className, search, onQuery, tags }) => {
    return (
        <>
            {search && (
                <Input
                    onChange={(e) => onQuery(e.target.value)}
                    disabled={tags === null}
                    placeholder="Search tags by their names"
                    mb={8}
                />
            )}
            <Paper withBorder p={8} style={style} className={className}>
                {children}
            </Paper>
        </>
    );
};

export default function TagCheckBoxList({
    tags,
    selectedTags,
    onChange,
    search = true,
    className = "",
    style = {},
}) {
    const [query, setQuery] = useState("");

    if (tags === null) {
        return (
            <Layout
                style={style}
                className={`${className}`}
                search={search}
                onQuery={(e) => setQuery(e)}
                tags={tags}
            >
                {Array(5)
                    .fill(null)
                    .map((x, idx) => (
                        <Skeleton h={30} mt={idx === 0 ? 0 : 8} key={idx} />
                    ))}
            </Layout>
        );
    }

    if (tags.length === 0) {
        return (
            <Paper withBorder p={16}>
                <Flex direction={"column"} align={"center"} gap={16}>
                    <IconTagOff
                        size={"20%"}
                        strokeWidth={1.25}
                        color="var(--mantine-primary-color-8)"
                    />
                    <Text fw={"bold"} size="20px">
                        We didn't find any tags
                    </Text>
                </Flex>
            </Paper>
        );
    }

    // TODO: remove uneeded console
    function onChangeHandler(id) {
        let tags = [...selectedTags];
        // console.log(tags);

        if (tags.includes(id)) {
            tags = tags.filter((x) => x !== id);
        } else {
            tags.push(id);
        }

        onChange(tags);
    }
    return (
        <>
            <Layout
                style={style}
                className={`${className}`}
                search={search}
                onQuery={(e) => setQuery(e)}
                tags={tags}
            >
                {tags.map((tag, idx) => {
                    if (!tag.name.includes(query)) {
                        return <></>;
                    }

                    return (
                        <Checkbox
                            label={capitalizeFirstLetter(tag.name)}
                            size="md"
                            mt={idx === 0 ? 0 : 8}
                            key={idx}
                            defaultChecked={selectedTags.includes(tag.id)}
                            onChange={() => onChangeHandler(tag.id)}
                        />
                    );
                })}
            </Layout>
        </>
    );
}
