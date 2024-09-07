import { Container, Paper, Tabs } from "@mantine/core";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { IconChartBar, IconUser } from "@tabler/icons-react";
import Stats from "./Components/Settings/Stats";

export default function Settings({ auth, title = "" }) {
    const iconProps = {
        size: 20,
        strokeWidth: 1.5,
    };

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />

            <Container mt={16}>
                <Tabs orientation="vertical" defaultValue={"stats"}>
                    <Tabs.List>
                        <Tabs.Tab value="stats" leftSection={<IconChartBar {...iconProps} />}>
                            Statistics
                        </Tabs.Tab>
                        <Tabs.Tab value="account" leftSection={<IconUser {...iconProps} />}>
                            Account
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="stats">
                        <Stats />
                    </Tabs.Panel>
                    <Tabs.Panel value="account">Welcome to account page</Tabs.Panel>
                </Tabs>
            </Container>
        </AuthLayout>
    );
}
