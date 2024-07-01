import { useState, useEffect, useRef } from "react";

function useElementSize() {
    const ref = useRef(null);
    const [size, setSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const updateSize = () => {
            setSize({
                width: ref.current.offsetWidth,
                height: ref.current.offsetHeight,
            });
        };

        window.addEventListener("resize", updateSize);
        updateSize();

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return [size, ref];
}

export default useElementSize;
