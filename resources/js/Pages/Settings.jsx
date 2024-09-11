import { Container, Paper, Tabs } from "@mantine/core";
import Title from "./Components/Title";
import AuthLayout from "./Layouts/AuthLayout";
import { IconChartBar, IconSettings2, IconUser } from "@tabler/icons-react";
import Stats from "./Components/Settings/Stats";
import General from "./Components/Settings/General";
import { useMediaQuery } from "@mantine/hooks";

export default function Settings({ auth, title = "" }) {
    const iconProps = {
        size: 20,
        strokeWidth: 1.5,
    };

    const tablet = useMediaQuery("(max-width: 1130px)");
    console.log(tablet);

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />

            <Container mt={16} mb={100} size={"lg"}>
                <Tabs orientation={tablet ? "horizontal" : "vertical"} defaultValue={"stats"}>
                    <Tabs.List>
                        <Tabs.Tab value="stats" leftSection={<IconChartBar {...iconProps} />}>
                            Statistics
                        </Tabs.Tab>
                        <Tabs.Tab value="general" leftSection={<IconSettings2 {...iconProps} />}>
                            General
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="stats">
                        <Stats />
                    </Tabs.Panel>
                    <Tabs.Panel value="general">
                        <General />
                    </Tabs.Panel>
                </Tabs>
            </Container>
        </AuthLayout>
    );
}
