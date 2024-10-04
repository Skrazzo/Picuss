import os
import sqlite3
import json
from dotenv import load_dotenv


# Load variables
load_dotenv("tags.env")
IMAGE_PATH = os.getenv("IMAGE_PATH")
DATABASE_PATH = os.getenv("DATABASE_PATH")

try:
    CONFIDENCE = float(os.getenv("CONFIDENCE"))
except ValueError as e:
    print(f"Error: Could not convert {os.getenv('CONFIDENCE')} to a float: {e}")
    exit(1)



print(f"Selected image directory: {IMAGE_PATH}")
print(f"Selected database: {DATABASE_PATH}")

if not os.path.exists(IMAGE_PATH):
    print("Image directory not found")
    exit(1)

if not os.path.exists(DATABASE_PATH):
    print("Database not found")
    exit(1)

try:
    conn = sqlite3.connect(DATABASE_PATH)
    conn.close()
except sqlite3.Error as e:
    print(f"Error connecting to database: {e}")
    exit(1)

# Connect to the database, and check if there's any images that need to be processed
conn = sqlite3.connect(DATABASE_PATH)
cur = conn.cursor()

try:
    count = cur.execute("SELECT COUNT(*) FROM pictures WHERE hidden = false AND sub_tags IS NULL").fetchone()[0]
    if count == 0:
        print("No images to process")
        exit(0)
except sqlite3.Error as e:
    print(f"Error selecting images: {e}")
    exit(1)

# Loading models
print("Loading models...")
from ultralytics import YOLO
import cv2

# Load the YOLOv11 classification model
cls_model = YOLO('yolo11x-cls.pt')

# Load the YOLOv11 object detection model
det_model = YOLO('yolo11x.pt')

def classify_image(image_path):
    try:
        results = cls_model(image_path, imgsz=512)
        top_5_class_indices = results[0].probs.top5
        tags = []
        for i in range(len(top_5_class_indices)):
            if results[0].probs.top5conf[i] > CONFIDENCE:
                tags.append(cls_model.names[top_5_class_indices[i]])
        return tags
    except Exception as e:
        print(f"Error classifying image {image_path}: {e}")
        return []

def detect_objects(image_path):
    try:
        img = cv2.imread(image_path)
        results = det_model(img)
        
        detections = []
        for result in results:
            for box in result.boxes:
                confidence = box.conf.item()
                class_id = box.cls.item()
                class_name = det_model.names[int(class_id)]
                
                if confidence > CONFIDENCE:
                    detections.append(class_name)
                
        return detections
    except Exception as e:
        print(f"Error detecting objects in image {image_path}: {e}")
        return []



# Get all pictures from the database that are not hidden
pictures = cur.execute("SELECT id, image FROM pictures WHERE hidden = false AND sub_tags IS NULL").fetchall()

for picture in pictures:
    picture_id, image_name = picture
    picture_path = os.path.join(IMAGE_PATH, str(image_name))
    
    if not os.path.exists(picture_path):
        print(f"Image not found: {picture_path}")
        continue
    
    # Perform image classification
    classification_tags = classify_image(picture_path)
    
    # Perform object detection
    object_detections = detect_objects(picture_path)
    
    # Combine classification tags and object detection results
    combined_tags = classification_tags + object_detections
    
    # Ensure unique values
    unique_tags = list(set(combined_tags))
    unique_tags = [tag.replace("_", " ") for tag in unique_tags]

    # Update the database
    try:
        cur.execute("UPDATE pictures SET sub_tags = ? WHERE id = ?", (json.dumps(unique_tags), picture_id))
    except sqlite3.Error as e:
        print(f"Error updating tags for image {picture_id}: {e}")
        continue

conn.commit()
conn.close()
print("Processing complete. Database updated with combined classification and detection results.")
