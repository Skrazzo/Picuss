import React from "react";
import "../../../../scss/LinkList.scss";
import { IconSparkles } from "@tabler/icons-react";
import { Text } from "@mantine/core";
import CheckTag from "./CheckTag";

export default function LinkList({ links }) {
    console.log(links);

    const empty_list_children = (
        <div className="no-links">
            <IconSparkles
                style={{ opacity: 0.9 }}
                color="var(--mantine-primary-color-filled-hover)"
                stroke={1.25}
            />
            <Text className={"main"}>NO PICTURES SHARED</Text>
            <Text className={"desc"}>
                Cmon show the world how beautiful you are
            </Text>
        </div>
    );

    return (
        <div className="linkList-container">
            {links.length === 0 && empty_list_children}

            <div>
                {links.map((link) => {
                    return (
                        <CheckTag
                            key={link.id}
                            id={link.public_id}
                            views={link.views}
                            downloads={link.downloads}

                            // onChange={checkboxCheckHandler}
                            // checked={selectedTags.includes(link.id)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
