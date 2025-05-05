#!/bin/bash

# Get input parameters: port and subdomain
PORT=$1
SUBDOMAIN=$2

# Check if both arguments are provided
if [ -z "$PORT" ] || [ -z "$SUBDOMAIN" ]; then
  echo "Usage: $0 <port> <subdomain>"
  exit 1
fi

# Start LocalTunnel with provided port and subdomain
lt --port "$PORT" --subdomain "$SUBDOMAIN"
