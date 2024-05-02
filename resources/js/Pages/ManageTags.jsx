import React from 'react'
import AuthLayout from './Layouts/AuthLayout'

export default function ManageTags({ auth }) {
    return (
        <AuthLayout auth={auth}>
            Hello to managing tags
        </AuthLayout>
    )
}
