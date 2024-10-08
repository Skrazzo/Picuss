# Requirements

### For linux server

Packages needed for Yolo:

-   python3
-   pip
-   python3-venv
-   python3-full

### Install script

Make install script executable if needed, and then run it

```sh
chmod +x ./install.sh
./install.sh
```

# Script configuration

In the Yolo directory locate `tags.env.example` file and rename it to `tags.env`. After that modify it to match your paths on the system.

**example tags.env file:**

```
IMAGE_PATH=/path/to/images/
DATABASE_PATH=/path/to/database.sql
```

# How to run

**All scripts have to be executed in Yolo directory.**

So we will need to execute the following command in the Yolo directory to run the script

```sh
./bin/python3 tags.py
```

This will open database file and pictures table, and search for all images that have sub_tags column as empty array. After that it will try to find corresponding image in the `IMAGE_PATH` with `picture->image` file name.

After finding the image, it will use YOLOv8 model to scan the image, and store found objects in picture table `sub_tags` column.
