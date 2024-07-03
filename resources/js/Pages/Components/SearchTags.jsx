import { ActionIcon, Checkbox, Flex, Paper, TextInput } from "@mantine/core";
import React, { useEffect, useRef, useState } from "react";
import capitalizeFirstLetter from "../Functions/capitalizeFirstLetter";
import { IconClearAll, IconZoom } from "@tabler/icons-react";

export default function SearchTags({ userTags, queryTags, closeDrawer }) {
    const [search, setSearch] = useState("");
    const firstRender = useRef(true);

    const tags = userTags.filter((tag) => tag.name.includes(search));

    function tagHandler(id) {
        if (queryTags[0].includes(id)) {
            queryTags[1](queryTags[0].filter((tag) => tag !== id));
        } else {
            queryTags[1]([...queryTags[0], id]);
        }
    }

    function clear() {
        setSearch("");
        queryTags[1]([]);
    }

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        const timeoutID = setTimeout(() => {
            console.log("asd");
            closeDrawer();
        }, 2000);
        return () => clearTimeout(timeoutID);
    }, [queryTags[0]]);

    return (
        <>
            <Flex align={"center"} p={8} gap={8}>
                <TextInput
                    value={search}
                    style={{ flex: "1" }}
                    placeholder="Search tags"
                    onChange={(x) => setSearch(x.currentTarget.value)}
                />
                <ActionIcon onClick={clear} size={"lg"} variant={"light"}>
                    <IconClearAll />
                </ActionIcon>
            </Flex>
            <Paper
                withBorder
                mx={8}
                p={8}
                // mah={300}
                mih={1000}
                style={{ overflowY: "auto" }}
            >
                {tags.map((tag, idx) => (
                    <Checkbox
                        onClick={() => tagHandler(tag.id)}
                        mt={4}
                        label={capitalizeFirstLetter(tag.name)}
                        key={tag.id}
                        checked={queryTags[0].includes(tag.id)}
                    />
                ))}
            </Paper>
        </>
    );
}
