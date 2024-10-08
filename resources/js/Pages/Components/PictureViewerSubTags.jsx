import { Paper, Text } from "@mantine/core";
import { IconHash, IconPhotoSearch, IconRobot } from "@tabler/icons-react";

export default function PictureViewerSubTags({ sub_tags, style: sty }) {
    return (
        <div className={sty.info_container}>
            {sub_tags !== null && sub_tags.length !== 0 && (
                <Paper p={"0.5rem"} withBorder className={sty.found_elements}>
                    {sub_tags.map((tag, idx) => (
                        <div key={idx} className={sty.sub_tag}>
                            <IconHash />
                            <span>{tag}</span>
                        </div>
                    ))}
                </Paper>
            )}

            {sub_tags === null && (
                <Paper p={"0.5rem"} withBorder className={sty.sub_tag_error}>
                    <IconRobot />
                    <Text size="lg">Will check this picture soon</Text>
                </Paper>
            )}

            {sub_tags !== null && sub_tags.length === 0 && (
                <Paper p={"0.5rem"} withBorder className={sty.sub_tag_error}>
                    <IconPhotoSearch />
                    <Text size="lg">Couldn't find any elements</Text>
                </Paper>
            )}
        </div>
    );
}
