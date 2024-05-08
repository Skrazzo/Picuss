import { IconPhotoX } from '@tabler/icons-react';
import sty from '../../../scss/upload.module.scss';
import React, { useMemo } from 'react';

export default function UploadImagePreview({ blob, onRemove }) {
    const imageURL = useMemo(() => URL.createObjectURL(blob), [blob]);

    return (
        <div className={sty.photo_container}>
            <div onClick={onRemove} className={sty.overlay}>
                <div className={sty.circle}><IconPhotoX size={24}/></div>
                <span>Remove picture</span>
            </div>
            <img src={imageURL} />
        </div>   
    );
};