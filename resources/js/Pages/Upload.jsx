import React from 'react'
import AuthLayout from './Layouts/AuthLayout'
import { Container } from '@mantine/core'

export default function Upload({ auth }) {
    return (
        <AuthLayout auth={auth}>
            <Container size={'md'}>
                <div style={{ border: '2px solid black', height: '200vh', }}></div>
            </Container>

            
        </AuthLayout>
    )
}
