import React, { useState } from 'react';
import sty from '../../../../scss/TagList.module.scss';
import TagMenu from './TagMenu';
import { IconPhoto, IconTag, IconWind } from '@tabler/icons-react';
import { Checkbox, Flex, Text, Transition } from '@mantine/core';
import CheckTag from './CheckTag';

export default function TagList({ tags, search }) {
    console.log('tags', tags);

    const [selectedTags, setSelectedTags] = useState([]);
    
    const empty_list_children = <>
        <div className={sty.tag_container_empty}>
            <IconWind style={{ opacity: 0.9 }} color='var(--mantine-primary-color-filled-hover)' size={'20%'} stroke={1.25} />
            <Text className={sty.main}>NO TAGS FOUND</Text>
            <Text className={sty.desc}>You must have blown them away</Text>
        </div>
    </>;

    const defaultHeaderIconProps = {
        color: 'var(--mantine-color-placeholder)',
        size: 19,
        strokeWidth: 1.5,
    };
    
    return (
        <div className={sty.container}>
            <div className={sty.head}>
                <TagMenu />
                <span className={sty.selected}>{selectedTags.length} {(selectedTags.length === 1) ? 'tag' : 'tags'}  selected</span>
            </div>
            <div className={sty.table_headers}>
                <Flex align={'center'} gap={8}>
                    <Checkbox />
                    <Flex align={'center'} gap={4}>
                        <IconTag {...defaultHeaderIconProps}/>
                        <Text mt={3} fw={'bold'}>Tag name</Text>
                    </Flex>
                </Flex>

                <Flex align={'center'} gap={4}>
                    <IconPhoto {...defaultHeaderIconProps}/>
                    <Text fw={'bold'} mt={5}>Pictures</Text>
                </Flex>
            </div>
            <div className={sty.tag_container}>
                <Transition
                    mounted={search}
                    transition={'fade'}
                    duration={150}
                    timingFunction="ease-out"
                >
                    {(styles) => 
                        <div style={styles} className={sty.create_msg}>
                            <IconTag color='var(--mantine-primary-color-filled-hover)' size={36} strokeWidth={1.25}/>
                            <div>
                                <Text>Create "{search}" tag</Text>
                                <Text c={'dimmed'} size='sm'>Press enter or send to create new tag</Text>
                            </div>
                            
                            
                        </div>
                    }
                </Transition>

                {(tags.length === 0) ? empty_list_children : 
                    <div>
                        {tags.map((tag, idx) => {
                            return <CheckTag name={tag.name} pictureCount={tag.pictureCount} id={tag.id} index={idx}/>;
                        })}
                    </div>
                }
            </div>
        </div>
    )
}
