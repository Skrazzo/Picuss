/**
 * Splits given array of images into segments based on the given segment control.
 *
 * Segment control is an array in the following format: [segmentType, segmentValue]
 * segmentType can be "all", "year", "month", "day"
 * segmentValue is currently not used
 *
 * Segmental switch returns an array of arrays, where the first element of each subarray is the name of the segment
 * and the second element is an array of images that fall into that segment
 *
 * @param {array} allImages - an array of all images
 * @param {array} images - an array of images that is being segmented
 * @param {array} segmentControl - an array of two elements, first is segment type, second is segment value
 * @returns {array} an array of arrays, where the first element of each subarray is the name of the segment
 * and the second element is an array of images that fall into that segment
 */
export default function segmentalSwitch(allImages = null, images = null, segmentControl = null) {
    console.log("executing");
    if (!allImages) {
        allImages = images.map((img) => img[1]).flat();
    }

    if (segmentControl === null) {
        console.error("Segment control in segmentalSwitch is null");
        return;
    }

    let arr = [];
    let months = [];

    switch (segmentControl[0]) {
        case "all":
            return [["All pictures", allImages]];
            break;
        case "year":
            arr = [];
            allImages.forEach((img) => {
                const year = new Date(img.uploaded).getFullYear();

                // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                let itemIndex = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i][0] === year) {
                        itemIndex = i;
                        break;
                    }
                }

                if (itemIndex !== false) {
                    arr[itemIndex][1].push(img);
                } else {
                    arr.push([year, [img]]);
                }
            });

            return arr;
            break;
        case "month":
            arr = [];

            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];

            allImages.forEach((img) => {
                const d = new Date(img.uploaded);

                // Get year and month variables
                const year = d.getFullYear();

                let month = months[d.getMonth()];

                // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                let itemIndex = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i][0] === `${month} ${year}`) {
                        itemIndex = i;
                        break;
                    }
                }

                if (itemIndex !== false) {
                    arr[itemIndex][1].push(img);
                } else {
                    arr.push([`${month} ${year}`, [img]]);
                }
            });

            return arr;
            break;
        case "day":
            arr = [];

            months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];

            allImages.forEach((img) => {
                const d = new Date(img.uploaded);

                // Get year and month variables
                const year = d.getFullYear();
                const month = months[d.getMonth()];
                const day = d.getDate();

                // We'll try to find array that matches images year, if not, the value will be false, otherwise index
                let itemIndex = false;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i][0] === `${month} ${day} ${year}`) {
                        itemIndex = i;
                        break;
                    }
                }

                if (itemIndex !== false) {
                    arr[itemIndex][1].push(img);
                } else {
                    arr.push([`${month} ${day} ${year}`, [img]]);
                }
            });

            return arr;
            break;
    }
}
