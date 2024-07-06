import { Checkbox } from "@mantine/core";
import React from "react";

export default function CheckTag({ key, id, views, downloads }) {
    return (
        <div className="checkTag">
            <div className="check">
                <Checkbox />
            </div>

            <div className="stats"></div>
        </div>
    );
}
