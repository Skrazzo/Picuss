import { useEffect, useState } from "react";
import {
    ActionIcon,
    Button,
    Combobox,
    Flex,
    InputBase,
    Loader,
    useCombobox,
} from "@mantine/core";
import { useForm } from "@inertiajs/inertia-react";
import axios from "axios";
import { IconHash } from "@tabler/icons-react";

export default function SelectCreatableTags({ select, addTag }) {
    const {
        data: formData,
        setData: setFormData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        name: "",
    });

    // -------- Mantine ----------
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [search, setSearch] = useState('');

    const exactOptionMatch = tags.some((item) => item === formData.name);
    const filteredOptions = exactOptionMatch
        ? tags
        : tags.filter((item) =>
              item["name"]
                  .toLowerCase()
                  .includes(formData.name.toLowerCase().trim())
          );

    const options = filteredOptions.map((item) => (
        <Combobox.Option value={item["id"]} key={item["id"]}>
            <Flex align={"center"} gap={4}>
                <IconHash color="var(--mantine-primary-color-8)" size={18} />
                {item["name"]}
            </Flex>
        </Combobox.Option>
    ));
    // ----- Mantine end ----------

    function createHandler() {
        // route('tags.create')
        post(route("tags.create"), {
            onError: () => reset(),
            onSuccess: () => {
                fetchTags({ addNewestTag: true });
                reset();
            },
        });
    }

    function fetchTags({ addNewestTag = false }) {
        axios
            .get(route("tags.get"))
            .then((res) => {
                const sortedTags = res.data.sort((a, b) => a.id - b.id); // sort array by id
                if (addNewestTag) select(sortedTags[sortedTags.length - 1]); // select newely created tag

                setTags(sortedTags);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }

    // Returns tag id and name in array format, from already loaded tags
    function getTagById(id) {
        return tags.find((obj) => obj.id === id);
    }

    useEffect(() => {
        setLoading(true);
        fetchTags({});
    }, []);

    return (
        <Combobox
            disabled={processing}
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                if (val === "$create") {
                    createHandler();
                } else {
                    // Find correct tag id by its id, and call select handler that was passed in the component
                    const tagArray = getTagById(val);
                    if (select) select(tagArray);
                    reset();
                }

                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    value={formData.name}
                    error={errors.name}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        setFormData("name", event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown();
                    }}
                    placeholder="Search value"
                    rightSection={
                        processing || loading ? (
                            <Loader size={18} />
                        ) : (
                            <Combobox.Chevron />
                        )
                    }
                    disabled={processing || loading}
                    rightSectionPointerEvents="none"
                    maxLength={20}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {options.length === 0 && formData.name === "" && (
                        <Combobox.Empty>
                            You haven't created any tags yet
                        </Combobox.Empty>
                    )}

                    {options}
                    {!exactOptionMatch && formData.name.trim().length > 0 && (
                        <Combobox.Option value="$create">
                            <b
                                style={{
                                    color: "var(--mantine-primary-color-8)",
                                }}
                            >
                                +
                            </b>{" "}
                            Create {formData.name}
                        </Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
