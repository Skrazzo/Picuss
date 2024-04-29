import React from 'react';
import sty from '../../../scss/dashboard.module.scss';

export default function MenuOption({ icon, text, hrefRoute, selected = false }) {
    return (
        <div className={(selected) ? sty.option_selected : sty.option}>
            <div className={sty.border}></div>
            {icon}
            <span>{text}</span>
        </div>
    )
}
