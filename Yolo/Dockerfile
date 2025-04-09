FROM ubuntu:22.04

WORKDIR /app

# Copy your YOLO code
COPY requirements.txt .

# Install python3
RUN apt update && apt update -y
RUN apt install python3 python3-venv libgl1-mesa-glx libglib2.0-0 cron vim -y

RUN python3 -m venv .
RUN ./bin/pip install -r requirements.txt


# Copy needed files
COPY tags.py .
COPY tags.env .
COPY entry.sh .
COPY run.sh .

COPY yolo-crontab /etc/cron.d/yolo
RUN chmod 0644 /etc/cron.d/yolo
RUN chown root:root /etc/cron.d/yolo

RUN chmod +x entry.sh
RUN chmod +x run.sh

CMD ["./entry.sh"]
