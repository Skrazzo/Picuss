import JSZip from "jszip";

async function handleZip({ images, download = true }) {
    const zip = new JSZip();

    // Add Images to the zip file
    for (let i = 0; i < images.length; i++) {
        let filename = images[i].name;

        // Find the last dot index
        let lastDotIndex = filename.lastIndexOf(".");

        // Extract file name without extension
        let filenameWithoutExtension = lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;

        // Extract file extension
        let fileExtension = lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : "";

        // add timestamp to the name
        let zipFiles = Object.keys(zip.files);
        let duplicateCount = 0;
        let finalName;
        // Ensure the file name is unique
        do {
            finalName =
                duplicateCount === 0 ? filenameWithoutExtension : `${filenameWithoutExtension} (${duplicateCount})`;
            finalName += ` ${Date.now()}.${fileExtension}`;
            duplicateCount++;
        } while (zipFiles.includes(finalName));

        zip.file(finalName, images[i]);
    }

    // Generate the zip file
    const zipData = await zip.generateAsync({
        type: "blob",
        streamFiles: true,
    });

    if (download) {
        // Create a download link for the zip file
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(zipData);
        link.download = "Compressed pictures.zip";
        link.click();
    } else {
        return zipData;
    }
}

export { handleZip };
