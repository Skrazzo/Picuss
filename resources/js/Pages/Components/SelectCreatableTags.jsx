import { useState } from 'react';
import { Button, Combobox, InputBase, Loader, useCombobox } from '@mantine/core';
import { useForm } from '@inertiajs/inertia-react';



export default function SelectCreatableTags() {
    const {
        data: formData,
        setData: setFormData,
        post,
        processing,
        reset,
        errors,
    } = useForm({
        name: '',
    });
    
    // -------- Mantine ----------
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [data, setData] = useState([]);
    const [value, setValue] = useState(null);
    // const [search, setSearch] = useState('');

    const exactOptionMatch = data.some((item) => item === formData.name);
    const filteredOptions = exactOptionMatch
        ? data
        : data.filter((item) => item.toLowerCase().includes(formData.name.toLowerCase().trim()));

    const options = filteredOptions.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));
    // ----- Mantine end ----------


    function createHandler(){
        // route('tags.create')

        post(route('tags.create'), {
            onError: () => reset(),
        });
        
        

        // setData((current) => [...current, search]);
        // setValue(search);

    }

    return (
        <Combobox
            disabled={processing}
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                if (val === '$create') {
                    createHandler();
                } else {
                    setValue(val);
                    setSearch(val);
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
                        setFormData('name', event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown();
                        setSearch(value || '');
                    }}
                    placeholder="Search value"
                    
                    rightSection={(processing) ? <Loader size={18}/> : <Combobox.Chevron />}
                    disabled={processing}
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    {(options.length === 0 && formData.name === '') &&
                        <Combobox.Empty>You haven't created any tags yet</Combobox.Empty>
                    }
                    
                    {options}
                    {!exactOptionMatch && formData.name.trim().length > 0 && (
                        <Combobox.Option value="$create">+ Create {formData.name}</Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}