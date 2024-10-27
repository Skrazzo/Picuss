import { useForm } from "@inertiajs/inertia-react";
import { Button, Flex, Paper, TextInput } from "@mantine/core";
import sty from "../../scss/auth.module.scss";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { IconLockOpen, IconLockOpenOff, IconUserPlus } from "@tabler/icons-react";
export default function Login() {
    const [login, setLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    function changeHandler(e) {
        setData(e.target.name, e.target.value);
    }

    function submitHandler(e) {
        e.preventDefault();
        setLoading(true);

        if (login) {
            post(route("post.login"), {
                onError: (e) => {
                    if (e.error !== undefined) {
                        notifications.show({
                            title: "Hmmm ... something's not right!",
                            message: e.error,
                            color: "red",
                            icon: <IconLockOpenOff strokeWidth={1.25} />,
                            withBorder: true,
                        });

                        reset();
                    }
                },
                onFinish: () => setLoading(false),
            });
        } else {
            post(route("post.register"), {
                onError: (e) => {
                    if (e.error !== undefined) {
                        notifications.show({
                            title: "Hmmm ... something's not right!",
                            message: e.error,
                            color: "red",
                            icon: <IconLockOpenOff strokeWidth={1.25} />,
                            withBorder: true,
                        });

                        reset();
                    }
                },
                onFinish: () => setLoading(false),
            });
        }
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
        username: "",
        password: "",
    });

    return (
        <form onSubmit={submitHandler} className={`${sty.container}`}>
            <Paper className={sty.paper} shadow={"md"}>
                <div className={sty.select_container}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setLogin(true);
                        }}
                        className={login ? sty.selected : ""}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setLogin(false);
                        }}
                        className={!login ? sty.selected : ""}
                        test="register-btn"
                    >
                        REGISTER
                    </button>
                </div>

                <Flex p={"md"} direction={"column"} gap={"sm"}>
                    <TextInput
                        value={data.username}
                        error={errors.username}
                        name="username"
                        onChange={changeHandler}
                        placeholder="Username"
                        test="username-input"
                    />
                    <TextInput
                        value={data.password}
                        error={errors.password}
                        name="password"
                        onChange={changeHandler}
                        placeholder="Password"
                        type="password"
                        test="password-input"
                    />

                    <Flex align={"center"} gap={"sm"}>
                        <Button
                            leftSection={login ? <IconLockOpen size={18} /> : <IconUserPlus size={18} />}
                            loading={loading}
                            onClick={submitHandler}
                        >
                            {login ? "Login" : "Register"}
                        </Button>
                    </Flex>
                </Flex>
            </Paper>
        </form>
    );
}
