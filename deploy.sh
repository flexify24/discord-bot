#!/bin/bash

# Define the app directory and the .env file path
APP_DIR="/home/ec2-user/discord-bot"
ENV_FILE="$APP_DIR/.env"

# Function to restart the app
restart_app() {
  echo "Restarting the app..."
  cd "$APP_DIR"
  pm2 restart discord-bot || pm2 start bot.js --name discord-bot
  echo "App is running!"
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

# Restart the app
restart_app
