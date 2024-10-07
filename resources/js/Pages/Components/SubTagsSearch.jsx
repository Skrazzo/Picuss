import { Input, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import sty from "../../../scss/SubTagsSearch.module.scss";
import { useState } from "react";

export default function SubTagsSearch({ subQuery, availableSearch = ["test", "person"] }) {
    // TODO: Make component that has an search input, and dropdown search suggestions
    const [inSearch, setInSearch] = useState(false);

    const iconProps = {
        size: 16,
        strokeWidth: 1.5,
    };

    return (
        <div className={sty.container}>
            <Input
                w={250}
                leftSection={<IconSearch {...iconProps} />}
                placeholder="Search pictures"
                value={subQuery[0]}
                onChange={(e) => subQuery[1](e.target.value)}
                onFocus={() => setInSearch(true)}
                onBlur={() => {
                    setTimeout(() => {
                        // I need this timeout onBlur, otherwise it sets state to false, and drop down closes before onClick is executed
                        setInSearch(false);
                    }, 100);
                }}
            />

            {inSearch && availableSearch.filter((tag) => tag.includes(subQuery[0])).length > 0 && (
                <div className={sty.dropdown}>
                    {availableSearch.map((tag) => {
                        if (!tag.includes(subQuery[0])) {
                            return;
                        }

                        return (
                            <div key={tag} className={sty.dropdownItem} onClick={() => subQuery[1](tag)}>
                                <Text>{tag}</Text>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
