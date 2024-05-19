import React from 'react'
import AuthLayout from './Layouts/AuthLayout';


export default function Dashboard({ auth, pictures }) {
    
  
    console.log(pictures);

    return (
        <AuthLayout auth={auth}>
            <p>Hello world</p>
        </AuthLayout>
    )
}
