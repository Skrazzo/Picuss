import { Input, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import sty from "../../../scss/SubTagsSearch.module.scss";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SubTagsSearch({ subQuery, onSearch = (search) => {} }) {
    // TODO: Make component that has an search input, and dropdown search suggestions
    const [inSearch, setInSearch] = useState(false);
    const [availableSearch, setAvailableSearch] = useState([]);
    const inputRef = useRef(null);

    const fetchAvailableSearch = () => {
        axios
            .get(route("get.sub.tags"))
            .then((res) => setAvailableSearch(res.data))
            .catch((err) => {
                console.error(err);
                setTimeout(() => {
                    fetchAvailableSearch();
                }, 1000);
            });
    };

    const previousSearch = useRef("");
    const searchHandler = (search) => {
        if (previousSearch.current === search) return;
        previousSearch.current = search;
        onSearch(search);
    };

    useEffect(() => {
        fetchAvailableSearch();

        // Add event listener, to capture enter key press
        const handleKeyDown = (event) => {
            switch (event.key) {
                case "Escape":
                    setInSearch(false);
                    subQuery[1]("");
                    inputRef.current.blur();
                    searchHandler("");
                    break;
                case "Enter":
                    searchHandler(inputRef.current.value);
                    break;
                default:
                    break;
            }
        };

        inputRef.current.addEventListener("keydown", handleKeyDown);

        return () => {
            if (inputRef.current !== null) {
                inputRef.current.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, []);

    const iconProps = {
        size: 16,
        strokeWidth: 1.5,
    };

    return (
        <div className={sty.container}>
            <Input
                ref={inputRef}
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
                            <div
                                key={tag}
                                className={sty.dropdownItem}
                                onClick={() => {
                                    subQuery[1](tag);
                                    searchHandler(tag);
                                }}
                            >
                                <Text>{tag}</Text>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
