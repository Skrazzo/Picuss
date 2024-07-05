import Logo from "../Components/Logo";
import sty from "../../../scss/authLayout.module.scss";
import { Text } from "@mantine/core";

export default function GuestLayout({ children }) {
    return (
        <div style={{ height: "100dvh", overflow: "auto" }}>
            <nav className={sty.nav}>
                <div
                    className={sty.logo}
                    onClick={() => (window.location.href = "/")}
                >
                    <Logo size={50} />
                    <Text fw={500}>Picuss</Text>
                </div>
            </nav>

            {children}
        </div>
    );
}
