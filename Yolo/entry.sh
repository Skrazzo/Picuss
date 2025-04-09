#!/bin/bash
set -m

# start python script
./run.sh

# load crontab file and run crontab
crontab /etc/cron.d/yolo
cron

# Keep the container running
tail -f /dev/null
