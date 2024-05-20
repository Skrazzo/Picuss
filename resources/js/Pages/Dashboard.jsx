import React, { useEffect, useState } from 'react'
import AuthLayout from './Layouts/AuthLayout';
import sty from '../../scss/Dashboard.module.scss';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import generateRandomBetween from './Functions/randomNumberBetween';
import { Center, Pagination, Skeleton } from '@mantine/core';
import axios from 'axios';
import 'react-lazy-load-image-component/src/effects/blur.css';

export default function Dashboard({ auth }) {
    const [page, setPage] = useState(1);
    const [images, setImages] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [processing, setProcessing] = useState(false);

    const skelets = Array(20).fill(null) ;
    
    function resetStates() {
        setImages([]);
    }

    useEffect(() => {
        resetStates();
        setProcessing(true);

        axios.get(route('get.resized.images', page)).then((res) => {
            setImages(res.data.images);
            setTotalPages(res.data.totalPages);
            setProcessing(false);
        });
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
                            key={i}
                            placeholderSrc={img.thumb}
                            src={route('get.image', img.id)}
                            effect='blur'
                        />
                    )}
                    </>
                }
            </div>

            <Center>
                <Pagination disabled={processing} mx={'auto'} my={32} total={totalPages} withEdges onChange={setPage}/>
            </Center>
        </AuthLayout>
    )
}
