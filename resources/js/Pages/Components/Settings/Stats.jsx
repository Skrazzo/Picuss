import { Fieldset, Paper, Text } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";
import darkMode from "../../Functions/checkDarkMode";
import createGradientArray from "../../Functions/createGradientArray";

export default function Stats() {
    const [calendar, setCalendar] = useState([]);

    useEffect(() => {
        axios.get(route("settings.get.stats")).then((res) => {
            setCalendar(res.data.pictures.calendarData);
            console.log(res.data.pictures.calendarData);
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
                    : createGradientArray("#00f63d", "#1f903b", 2)
            }
            margin={{ left: 20 }}
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

    // TODO: Finish statistics, and make CalendarGraph responsive

    return (
        <Paper mx={16}>
            <Fieldset legend={"Picture uploads this year"} h={175 + 16} px={8} py={16}>
                <CalendarGraph data={calendar} year={new Date().getFullYear()} />
            </Fieldset>
        </Paper>
    );
}
