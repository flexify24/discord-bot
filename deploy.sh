#!/bin/bash

# Define the .env file path and the app's entry file
ENV_FILE=".env"
APP_ENTRY="bot.js"

# Function to stop the existing app
stop_app() {
  echo "Stopping any existing instance of the app..."
  pkill -f "node $APP_ENTRY" && echo "App stopped." || echo "No running instance found."
}

# Function to start the app
start_app() {
  echo "Starting the app..."
  nohup node "$APP_ENTRY" > app.log 2>&1 &
}

# Prompt the user if they want to change the token
echo "Do you want to update the Discord bot token? (yes/no)"
read -r update_token

if [[ "$update_token" == "yes" ]]; then
  # Ask for the new token
  echo "Please enter the new Discord bot token:"
  read -r DISCORD_TOKEN

  # Check if the .env file exists, create it if not
  if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    touch "$ENV_FILE"
  fi

  # Add or update the token in the .env file
  if grep -q "DISCORD_TOKEN=" "$ENV_FILE"; then
    sed -i "s/^DISCORD_TOKEN=.*/DISCORD_TOKEN=$DISCORD_TOKEN/" "$ENV_FILE"
  else
    echo "DISCORD_TOKEN=$DISCORD_TOKEN" >> "$ENV_FILE"
  fi

  echo "Token has been updated!"
else
  echo "Keeping the existing token."
fi

# Stop any running app instance and start the app
stop_app
start_app
