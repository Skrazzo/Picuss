import { useForm } from "@inertiajs/inertia-react"
import { Button, Flex, Input, Paper, Text } from "@mantine/core";
import sty from '../../scss/auth.module.scss';
import { useState } from "react";

export default function Login() {
    const [login, setLogin] = useState(true);

    function changeHandler(e){
        setData(e.target.name, e.target.value);
    }

    function submitHandler(e){
        e.preventDefault();
        post(route('post.login'));
    }
    
    const {
        data,
        setData,
        post,
		// delete: destroy, // way of setting these function with different names
        processing,
        reset,
        errors,
    } = useForm({
        username: '',
        password: '',
    });

    return (
        <div className={`${sty.container}`}>
            <Paper className={sty.paper} shadow={"sm"}>
                <div className={sty.select_container}>
                    <button onClick={() => setLogin(true)} className={(login) ? sty.selected : ''}>LOGIN</button>
                    <button onClick={() => setLogin(false)} className={(!login) ? sty.selected : ''}>REGISTER</button>
                </div>

                <Flex p={'md'} direction={'column'} gap={'sm'}>
                    <Input w={'full'} placeholder="Username"/>
                    <Input placeholder="Password" type="password"/>
                    <div >
                        <Button>{(login) ? 'Login' : 'Register'}</Button>
                    </div>
                </Flex>
            </Paper>

        </div>
        
    )
}
