import { Input, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import sty from "../../../scss/SubTagsSearch.module.scss";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function SubTagsSearch({ subQuery, onSearch = (search) => {} }) {
    const [inSearch, setInSearch] = useState(false);
    const [availableSearch, setAvailableSearch] = useState([]);
    const keySelect = useRef(0);
    const inputRef = useRef(null);
    const dropDownRef = useRef(null);

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
    /**
     * Search handler, this function is called when the user types in the
     * search bar and presses enter. It checks if the new search query is different from the
     * previous one, and if so it calls the onSearch callback with the
     * new search query.
     * @param {string} search The new search query
     */
    const searchHandler = (search) => {
        if (previousSearch.current === search) return;
        previousSearch.current = search;
        onSearch(search);
    };

    /**
     * Return the number of search results, by filtering the available search tags array.
     * The filter condition is that the tag includes the current subQuery value.
     * @returns {number} The number of search results.
     */
    const getSearchResultCount = (customSearch = null) => {
        return availableSearch.filter((tag) => tag.includes(customSearch || subQuery[0])).length;
    };

    useEffect(() => {
        fetchAvailableSearch();

        return () => {
            if (inputRef.current !== null) {
                inputRef.current.removeEventListener("keydown", handleKeyDown);
            }
        };
    }, []);

    /**
     * Handle key presses for moving the selected item in the dropdown.
     * @param {object} event The event object.
     * @param {string} event.direction The direction of the movement. Can be "up", "down", or "reset".
     */
    const moveKey = ({ direction }) => {
        if (dropDownRef.current === null) return;
        // Remove class from old element, and add it to the new one
        let el = dropDownRef.current.querySelector(`div:nth-child(${keySelect.current})`);
        if (el !== null) el.classList.remove(sty.dropdown_item_active);

        // Decide to which direction we need to move
        switch (direction) {
            case "up":
                if (keySelect.current <= 1) {
                    keySelect.current = getSearchResultCount();
                } else {
                    keySelect.current -= 1;
                }
                break;
            case "down":
                if (keySelect.current > getSearchResultCount() - 1) {
                    keySelect.current = 1;
                } else {
                    keySelect.current += 1;
                }
                break;
            case "reset":
                keySelect.current = 0;
                break;
            default:
                throw new Error("Invalid direction");
                break;
        }

        // Add new class
        el = dropDownRef.current.querySelector(`div:nth-child(${keySelect.current})`);
        if (el !== null) {
            el.classList.add(sty.dropdown_item_active);
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // Add event listener, to capture enter key press
    const handleKeyDown = (event) => {
        switch (event.key) {
            case "Escape":
                subQuery[1](""); // Clear input
                inputRef.current.blur(); // out focus the input
                searchHandler(""); // Clear search
                // moveKey({ direction: "reset" }); // Reset marker

                setTimeout(() => {
                    setInSearch(false); // Close dropdown
                }, 100);
                break;
            case "Enter":
                if (keySelect.current !== 0 && dropDownRef.current !== null) {
                    dropDownRef.current.querySelector(`div:nth-child(${keySelect.current})`).click();
                } else {
                    searchHandler(inputRef.current.value);
                }
                break;
            case "ArrowDown":
                moveKey({ direction: "down" });
                break;
            case "ArrowUp":
                moveKey({ direction: "up" });
                break;

            default:
                break;
        }
    };

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
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    setInSearch(true);
                }}
                onBlur={() => {
                    setTimeout(() => {
                        // I need this timeout onBlur, otherwise it sets state to false, and drop down closes before onClick is executed
                        setInSearch(false);
                        moveKey({ direction: "reset" });
                    }, 100);
                }}
            />

            {inSearch && getSearchResultCount() > 0 && (
                <div className={sty.dropdown} ref={dropDownRef}>
                    {availableSearch.map((tag, idx) => {
                        if (!tag.includes(subQuery[0])) {
                            return;
                        }

                        return (
                            <div
                                key={tag}
                                className={sty.dropdown_item}
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
