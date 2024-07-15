import { Text } from "@mantine/core";
import React from "react";

const iconProps = {
    strokeWidth: 1.25,
    color: "green",
};

const SectionTitle = ({ text, icon, rightSection = <></>, iconSize = 20 }) => (
    <div className={"drawer-section-title"}>
        <div>
            {React.cloneElement(icon, { ...iconProps, size: iconSize })}

            <Text size="20px" fw={"bold"}>
                {text}
            </Text>
        </div>
        {rightSection}
    </div>
);

export default SectionTitle;
