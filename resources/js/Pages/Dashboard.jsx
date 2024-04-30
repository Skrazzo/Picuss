import React from 'react'
import AuthLayout from './Layouts/AuthLayout';


export default function Dashboard({ auth }) {
    
  
    console.log(auth);

    return (
        <AuthLayout auth={auth}>
            <p>Hello world</p>
        </AuthLayout>
    )
}
