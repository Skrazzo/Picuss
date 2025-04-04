import { IconHeading } from "@tabler/icons-react";
import { Flex, Title } from "@mantine/core";
import React from "react";
import { useMediaQuery } from "@mantine/hooks";

export default function TitleWithIcon({
    title = "title",
    icon = <IconHeading />,
    order = 2,
    flexGap = 8,
    my = 1,
    rightSection = { element: <></>, alignLeft: true },
}) {
    const mobile = useMediaQuery("(max-width: 640px)");

    return (
        <Flex justify={rightSection.alignLeft && !mobile ? "flex-start" : "space-between"} align={"center"} my={my}>
            <Flex align={"center"} gap={flexGap}>
                <div style={{ color: "var(--mantine-primary-color-8)", display: "grid", placeItems: "center" }}>
                    {icon}
                </div>
                <Title order={order}>{title}</Title>
            </Flex>

            {rightSection.element}
        </Flex>
    );
}
