import os
from dotenv import load_dotenv
from ultralytics import YOLO
import sqlite3
import json

# Load variables
load_dotenv("tags.env")
IMAGE_PATH = os.getenv("IMAGE_PATH")
DATABASE_PATH = os.getenv("DATABASE_PATH")

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

# Load the YOLOv11 classification model
model = YOLO('yolo11x-cls.pt') 

# Connect to the database
conn = sqlite3.connect(DATABASE_PATH)
cur = conn.cursor()

# Get all pictures from the database, that are not hidden
pictures = cur.execute("SELECT id, image FROM pictures WHERE hidden = false AND sub_tags IS NULL OR sub_tags = ''").fetchall()
for picture in pictures:
    picturePath = IMAGE_PATH + str(picture[1])
    
    if not os.path.exists(picturePath): # Continue if image does not exist
        continue
    
    # Perform image classification
    try:
        results = model(picturePath, imgsz=512)
    except Exception as e:
        print(f"Error processing image {picturePath}: {e}")
        continue

    # Filter out with 0.3 confidence
    top_5_class_indices = results[0].probs.top5
    tags = []
    for i in range(len(top_5_class_indices)):
        if results[0].probs.top5conf[i] > 0.3:
            tags.append(model.names[top_5_class_indices[i]])
    
    try:
        cur.execute("UPDATE pictures SET sub_tags = ? WHERE id = ?", (json.dumps(tags), picture[0]))
    except sqlite3.Error as e:
        print(f"Error updating tags for image {picture[0]}: {e}")
        continue
    

conn.commit()
conn.close()
exit(0)
