import { Paper } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";
import { ResponsiveCalendar } from "@nivo/calendar";

export default function Stats() {
    const [calendar, setCalendar] = useState([]);

    useEffect(() => {
        axios.get(route("settings.get.stats")).then((res) => {
            setCalendar(res.data.pictures.calendarData);
            console.log(res.data.pictures.calendarData);
        });
    }, []);

    const CalendarGraph = ({ data, year }) => (
        <ResponsiveCalendar
            data={data}
            from={year}
            to={year}
            emptyColor="#eeeeee"
            colors={["#61cdbb", "#97e3d5", "#e8c1a0", "#f47560"]}
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
            yearSpacing={100}
            monthBorderColor="#ffffff"
            dayBorderWidth={2}
        />
    );

    return (
        <Paper withBorder mx={16}>
            <Paper h={200} withBorder={false}>
                <CalendarGraph data={calendar} year={new Date().getFullYear().toString()} />
            </Paper>
        </Paper>
    );
}
