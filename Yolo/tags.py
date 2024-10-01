import os
from ultralytics import YOLO

# Load the YOLOv8 classification model
model = YOLO('yolov8x-cls.pt') 

# Path to your image
images = [f for f in os.listdir('images') if os.path.isfile(os.path.join('images', f))]

for image in images:
    # Perform image classification
    results = model('images/' + str(image), imgsz=512)

    # Extract tags (top-5 predictions)
    # Get the top 5 class indices
    top_5_class_indices = results[0].probs.top5

    # Use the class indices to get the corresponding class names
    tags = [model.names[idx] for idx in top_5_class_indices]

    # Display tags
    print(image, tags)
