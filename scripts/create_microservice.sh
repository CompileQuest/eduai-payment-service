#!/bin/bash

# Check if component name is provided
if [ -z "$1" ]; then
  echo "Please provide the component name as an argument."
  echo "Usage: ./create_microservice.sh <component_name>"
  exit 1
fi

# Set the component name
COMPONENT_NAME=$1

# Create the base directory
mkdir -p "$COMPONENT_NAME"

# Navigate to the component directory
cd "$COMPONENT_NAME" || exit

# Create base files
touch app_error.log package-lock.json package.json sampledata.json

# Create src structure
mkdir -p src/api/middlewares src/api/routes src/events   src/config src/database/models src/database/repository src/services src/utils


# Create files in api folder
touch src/api/events/app_events.js src/api/routes/customer.js src/api/index.js src/api/middlewares/auth.js



# Create files in config folder
touch src/config/index.js

# Create files in database folder
touch src/database/connection.js src/database/index.js  src/database/repository/customer-repository.js

# Create main files
touch src/express-app.js src/index.js

# Create service file
touch src/services/customer-service.js

# Create utils files
touch src/utils/app-errors.js src/utils/error-handler.js src/utils/index.js

echo "Folder structure created for component: $COMPONENT_NAME"
