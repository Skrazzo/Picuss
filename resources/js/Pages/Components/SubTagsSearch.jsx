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
                onBlur={() => setInSearch(false)}
            />

            {inSearch && (
                <div className={sty.dropdown}>
                    {availableSearch.map((tag) => (
                        <div key={tag} className={sty.dropdownItem} onClick={(e) => console.log(tag)}>
                            <Text onClick={() => console.log(tag)}>{tag}</Text>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
