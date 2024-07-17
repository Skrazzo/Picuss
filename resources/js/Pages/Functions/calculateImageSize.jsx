// Calculates image size responsively
function calculateImageSize(screenSize, imageSize) {
    // console.log(`screen: ${screenSize}, image: ${imageSize}`);

    // Calc aspect ratio for images
    const aspectRatio = imageSize[0] / imageSize[1];

    if (imageSize[0] > screenSize[0]) {
        /*
            If image width is more that screen width, we need to set it to match
            screen width, and adjust height with aspect ratio
        */
        imageSize[0] = screenSize[0];
        imageSize[1] = imageSize[0] / aspectRatio;
    }

    if (imageSize[1] > screenSize[1]) {
        /*
            If image height is more than screen height, we need to set it to match it
            and adjust screen width to the aspect ratio
        */

        imageSize[1] = screenSize[1];
        imageSize[0] = aspectRatio * imageSize[1];
    }

    // Now we can return image size
    return imageSize;
}

export default calculateImageSize;
