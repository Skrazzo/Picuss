import React from 'react';
import sty from '../../../scss/authLayout.module.scss';

export default function MenuOption({ icon, text, hrefRoute, currentRoute}) {
    var selected = false;
    
    if(hrefRoute === currentRoute){
        selected = true;
    }
    
    return (
        <div className={(selected) ? sty.option_selected : sty.option}>
            <div className={sty.border}></div>
            {icon}
            <span>{text}</span>
        </div>
    )
}
