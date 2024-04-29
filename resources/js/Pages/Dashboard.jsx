import React from 'react'
import AuthLayout from './Layouts/AuthLayout';


export default function Dashboard({ auth }) {
    
  
    console.log(auth);

    return (
        <AuthLayout>
            <p>Hello world</p>
        </AuthLayout>
    )
}
