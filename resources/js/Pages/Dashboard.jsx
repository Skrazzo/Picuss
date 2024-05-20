import React, { useEffect, useState } from 'react'
import AuthLayout from './Layouts/AuthLayout';
import sty from '../../scss/Dashboard.module.scss';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import generateRandomBetween from './Functions/randomNumberBetween';
import { Skeleton } from '@mantine/core';
import axios from 'axios';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function Dashboard({ auth }) {
    const [page, setPage] = useState(1);
    const [images, setImages] = useState([]);
    const skelets = Array(15).fill(null) ;
    
    useEffect(() => {
        axios.get(route('get.resized.images', page)).then((res) => setImages(res.data));
    }, [page]) ;
    
    return (
        <AuthLayout auth={auth}>
            <div className={sty.container}>
                {(images.length === 0) ?
                    <>
                    {skelets.map((x, i) => 
                        <Skeleton key={i} className={sty.column} h={generateRandomBetween(100,300)}/>
                    )}
                    </>
                    :
                    <>
                    {images.map((img, i) =>
                        <LazyLoadImage 
                            placeholderSrc={img.thumb}
                            src={route('get.image', img.id)}
                            effect='blur'
                        />
                    )}
                    </>
                }
            </div>            
        </AuthLayout>
    )
}
