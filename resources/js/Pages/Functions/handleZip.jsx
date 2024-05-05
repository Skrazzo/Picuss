import JSZip from "jszip";


async function handleZip(images) {
    const zip = new JSZip();

    // Add Images to the zip file
    for (let i = 0; i < images.length; i++) {
        zip.file(images[i].name, images[i]);
    }

    // Generate the zip file
    const zipData = await zip.generateAsync({
        type: "blob",
        streamFiles: true,
    });

    // Create a download link for the zip file
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(zipData);
    link.download = "Compressed pictures.zip";
    link.click();
}

export { handleZip };