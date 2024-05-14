import React, { useState } from 'react';
import sty from '../../../../scss/TagList.module.scss';
import TagMenu from './TagMenu';
import { IconWind } from '@tabler/icons-react';
import { Text } from '@mantine/core';

export default function TagList({ tags }) {
    const [selectedTags, setSelectedTags] = useState([]);
    
    const empty_list_children = <>
        <div className={sty.tag_container_empty}>
            <IconWind style={{ opacity: 0.9 }} color='var(--mantine-primary-color-filled-hover)' size={'20%'} stroke={1.25} />
            <Text className={sty.main}>NO TAGS FOUND</Text>
            <Text className={sty.desc}>You must have blown them away</Text>
        </div>
    </>;
    
    return (
        <div className={sty.container}>
            <div className={sty.head}>
                <TagMenu />
                <span className={sty.selected}>{selectedTags.length} {(selectedTags.length === 1) ? 'tag' : 'tags'}  selected</span>
            </div>
            <div className={sty.tag_container}>
                {(tags.length === 0) ? empty_list_children : 
                    <></>
                }
            </div>
        </div>
    )
}
