import { Fieldset, Paper, Text } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import darkMode from "../../Functions/checkDarkMode";
import createGradientArray from "../../Functions/createGradientArray";
import { useMediaQuery } from "@mantine/hooks";
import { ResponsivePie } from "@nivo/pie";
import UserStats from "../UserStats";

export default function Stats() {
    const [calendar, setCalendar] = useState([]);
    const [pie, setPie] = useState([
        {
            id: "loading",
            label: "Loading...",
            value: 1,
        },
    ]);
    const [userInfo, setUserInfo] = useState(null);

    const tablet = useMediaQuery("(max-width: 1130px)");
    const phone = useMediaQuery("(max-width: 640px)");

    useEffect(() => {
        axios.get(route("settings.get.stats")).then((res) => {
            setCalendar(res.data.pictures.calendarData);
            setPie(res.data.tags.pieData);
        });

        axios
            .get(route("user.modal.info"))
            .then((res) => {
                setUserInfo(res.data);
            })
            .catch((err) => {
                alert("Error has appeared! Please check the console!");
                console.error(err);
            });
    }, []);

    /**
     * Returns current date, or current date with custom year
     * @param {string} customYear define a custom year
     */
    const getCurrentDate = (customYear = null) => {
        const d = new Date();
        let date = `${d.getFullYear()}-${d.getMonth() < 10 ? `0` : ``}${d.getMonth()}-${d.getDate() < 10 ? `0` : ``}${d.getDate()}`;
        return date;
    };

    /**
     * Gives string date of the first day of the year
     * @param {*} year
     * @returns Start of the year in string format
     */
    const getStartOfYear = (year) => {
        return `${year}-01-01`;
    };

    const CalendarGraph = ({ data, year }) => (
        <ResponsiveCalendar
            data={data}
            from={year.toString()}
            to={year.toString()}
            emptyColor={darkMode() ? "#353535" : "#eeeeee"}
            colors={
                darkMode()
                    ? createGradientArray("#1f903b", "#00f63d", 2)
                    : createGradientArray("#5aed7f", "#1f903b", 2)
            }
            margin={{ left: 20, top: 10 }}
            yearSpacing={100}
            monthBorderColor={darkMode() ? "#242424" : "#ffffff"}
            dayBorderWidth={2}
            dayBorderColor={darkMode() ? "#242424" : "#ffffff"}
            theme={{
                text: {
                    fill: darkMode() ? "#eeeeee" : "#333333",
                },
            }}
        />
    );

    const PieGrapgh = ({ data }) => (
        <ResponsivePie
            onClick={(node) =>
                (window.location.href = `${route(`dashboard`)}/?tag=${node.data.label}`)
            }
            colors={
                darkMode()
                    ? createGradientArray("#1f903b", "#00f63d", 2)
                    : createGradientArray("#5aed7f", "#1f903b", 2)
            }
            data={data}
            margin={{ top: 40, bottom: 40, left: 40, right: 40 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]],
            }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor={darkMode() ? "#eeeeee" : "#333333"}
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
            }}
            defs={[
                {
                    id: "dots",
                    type: "patternDots",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    size: 4,
                    padding: 1,
                    stagger: true,
                },
                {
                    id: "lines",
                    type: "patternLines",
                    background: "inherit",
                    color: "rgba(255, 255, 255, 0.3)",
                    rotation: -45,
                    lineWidth: 6,
                    spacing: 10,
                },
            ]}
        />
    );

    return (
        <Paper mx={tablet ? 0 : 16} my={tablet ? 16 : 0}>
            <Fieldset
                legend={"Picture uploads this year"}
                px={8}
                py={16}
                style={{ aspectRatio: phone ? "1/0.30" : "1/0.25" }}
            >
                <CalendarGraph data={calendar} year={new Date().getFullYear()} />
            </Fieldset>

            <Fieldset
                legend={"Tags and picture usage"}
                px={8}
                py={16}
                mt={8}
                style={{ aspectRatio: phone ? "1/0.8" : "1/0.6" }}
            >
                <PieGrapgh data={pie} />
            </Fieldset>

            <Fieldset legend={"User stats"} mt={8} p={16}>
                <UserStats data={userInfo} />
            </Fieldset>
        </Paper>
    );
}
