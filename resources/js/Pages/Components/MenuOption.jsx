import React from 'react';
import sty from '../../../scss/dashboard.module.scss';

export default function MenuOption({ icon, text, hrefRoute }) {
    return (
        <div className={sty.menu}>
            <div className={sty.option}>
                <div className={sty.border}></div>
                {icon}
                <span>{text}</span>
            </div>
        </div>
    )
}
