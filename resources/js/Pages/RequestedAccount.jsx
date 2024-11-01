import { IconUserCheck } from "@tabler/icons-react";
import sty from "../../scss/request.module.scss";

export default function RequestedAccount() {
    return (
        <div className={sty.container}>
            <IconUserCheck />
            <h1>Account Creation Requested</h1>
            <p>We're processing your request. Check back in later.</p>

            <a href={route("login")}>Return to Login</a>
        </div>
    );
}
