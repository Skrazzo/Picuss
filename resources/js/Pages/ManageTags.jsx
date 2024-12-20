import React, { useState } from "react";
import AuthLayout from "./Layouts/AuthLayout";
import { Container, Flex, Input } from "@mantine/core";
import TitleWithIcon from "./Components/TitleWithIcon";
import { IconSearch, IconTags } from "@tabler/icons-react";
import TagList from "./Components/TagList/TagList";
import { useForm } from "@inertiajs/inertia-react";
import Title from "./Components/Title";

export default function ManageTags({ auth, tags, title = "" }) {
    const [useTags, setUseTags] = useState(sortTags(tags));

    //console.log(useTags);

    const form = useForm({
        name: "",
    });

    function sortTags(tags) {
        return tags.sort((a, b) => b.pictureCount - a.pictureCount);
    }

    function sortAndSetTags(tags) {
        setUseTags(sortTags(tags));
    }

    function formSubmitHandler(e) {
        e.preventDefault();
        if (form.data.name === "") return;

        form.post(route("tags.create"), {
            onSuccess: (res) => {
                setUseTags(sortTags(res.props.tags));
                form.reset();
            },
        });
    }

    return (
        <AuthLayout auth={auth}>
            <Title title={title} />
            <Container size={"md"} py={"md"}>
                <TitleWithIcon
                    title={`Manage your ${tags.length} tags`}
                    order={3}
                    icon={<IconTags size={28} strokeWidth={1.5} />}
                    my={16}
                />

                <Flex gap={8}>
                    <Input.Wrapper
                        label=""
                        description="Search or create new tags"
                        error=""
                        w={"100%"}
                        test="search-input"
                    >
                        <form onSubmit={formSubmitHandler}>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData("name", e.currentTarget.value)}
                                leftSection={<IconSearch size={18} />}
                                placeholder="Search tag name"
                                maxLength={20}
                                error={form.errors.name}
                            />
                        </form>
                    </Input.Wrapper>
                </Flex>

                <TagList tags={useTags} search={form.data.name} setTags={(tags) => sortAndSetTags(tags)} />
            </Container>
        </AuthLayout>
    );
}
