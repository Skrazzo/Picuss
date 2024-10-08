#!/bin/bash

sudo apt update
sudo apt upgrade
sudo apt install python3 pip python3-venv python3-full

python3 -m venv ./
./bin/pip install -r requirements.txt
