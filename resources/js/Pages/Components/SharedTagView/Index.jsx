import React from "react";
import "../../../../scss/SharedTagView.scss";
import GuestLayout from "../../Layouts/GuestLayout";

export default function Index({ id }) {
    console.log(id);

    return (
        <GuestLayout>
            <span>Hello world</span>
        </GuestLayout>
    );
}
