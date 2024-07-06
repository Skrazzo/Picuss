import React, { useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import { Container, Flex, Paper, Tabs } from "@mantine/core";
import TitleWithIcon from "./Components/TitleWithIcon";
import { IconPhoto, IconShare2, IconTags } from "@tabler/icons-react";
import LinkList from "./Components/LinkList/LinkList";

export default function ManageLinks({ auth, links: dbLinks }) {
    const [links, setLinks] = useState(dbLinks);
    const iconStyle = { size: 16 };

    return (
        <AuthLayout auth={auth}>
            <Container size={"md"} py={"md"}>
                <TitleWithIcon
                    title={`Manage your ${links.length} shared links`}
                    order={3}
                    icon={<IconShare2 size={28} strokeWidth={1.5} />}
                    my={16}
                />

                <Paper mt={8} withBorder>
                    <Tabs defaultValue={"pictures"}>
                        <Tabs.List>
                            <Tabs.Tab
                                value="pictures"
                                leftSection={<IconPhoto {...iconStyle} />}
                            >
                                Pictures
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="tags"
                                leftSection={<IconTags {...iconStyle} />}
                            >
                                Tags
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="pictures">
                            <LinkList links={links} />
                        </Tabs.Panel>
                    </Tabs>
                </Paper>
            </Container>
        </AuthLayout>
    );
}
