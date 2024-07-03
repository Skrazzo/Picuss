import { Divider, Flex, Group, Text } from "@mantine/core";
import React from "react";

export default function PictureDivider(props) {
    return (
        <Flex align={"center"} gap={16} pb={0} p={16}>
            <Divider w={"100%"} />
            <Text size={"xl"} c={"dimmed"} style={{ textWrap: "nowrap" }}>
                {props.title}
            </Text>
            <Divider w={"100%"} />
        </Flex>
    );
}
