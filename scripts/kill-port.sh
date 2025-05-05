#!/bin/bash

if [ -z "$1" ]; then
    echo "Please provide a port number"
    echo "Usage: ./kill-port.sh <port>"
    exit 1
fi

PORT=$1
PID=$(lsof -t -i:$PORT)

if [ -z "$PID" ]; then
    echo "No process found running on port $PORT"
    exit 0
fi

echo "Killing process $PID running on port $PORT"
kill -9 $PID
echo "Process killed successfully" 