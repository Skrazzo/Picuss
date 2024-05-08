import { IconPhotoX } from '@tabler/icons-react';
import sty from '../../../scss/upload.module.scss';
import React from 'react';

const UploadImagePreview = React.memo(({ blob, onRemove }) => {
    console.log('image render', blob);

    return (
        <div className={sty.photo_container}>
            <div onClick={onRemove} className={sty.overlay}>
                <div className={sty.circle}><IconPhotoX size={24}/></div>
                <span>Remove picture</span>
            </div>
            <img src={URL.createObjectURL(blob)} />
        </div>   
    );
});

export default UploadImagePreview;
    

