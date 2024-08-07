import React, { useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import { Container, Flex, Paper, Tabs } from "@mantine/core";
import TitleWithIcon from "./Components/TitleWithIcon";
import { IconPhoto, IconShare2, IconTags } from "@tabler/icons-react";
import LinkList from "./Components/LinkList/LinkList";
import Title from "./Components/Title";
import TagLinkList from "./Components/LinkList/TagLinkList";

export default function ManageLinks({ auth, links: dbLinks, title = "" }) {
    const [links, setLinks] = useState(dbLinks);
    const iconProps = { size: 16 };

    console.log(links);

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
            <Container size={"md"} py={"md"}>
                <TitleWithIcon
                    title={`Manage your shared links`}
                    order={3}
                    icon={<IconShare2 size={28} strokeWidth={1.5} />}
                    my={16}
                />

                <Paper mt={8} withBorder>
                    <Tabs defaultValue={"pictures"}>
                        <Tabs.List>
                            <Tabs.Tab
                                value="pictures"
                                leftSection={<IconPhoto {...iconProps} />}
                            >
                                Pictures
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="tags"
                                leftSection={<IconTags {...iconProps} />}
                            >
                                Tags
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="pictures">
                            <LinkList links={links.pictures} />
                        </Tabs.Panel>

                        <Tabs.Panel value="tags">
                            <TagLinkList links={links.tags} />
                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Container>
        </AuthLayout>
    );
}
