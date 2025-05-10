#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Pipelines return the exit status of the last command to fail, or zero if all commands in the pipeline exit successfully.
set -o pipefail

REPOSITORY_PATH="school"
BRANCH="main" # Or your main branch name

cd "$REPOSITORY_PATH" || exit 1

echo "Checking for changes in repository..."

git fetch origin "$BRANCH"

if ! git diff --quiet "origin/$BRANCH" "$BRANCH"; then
  echo "Changes detected. Pulling latest code..."
  git pull origin "$BRANCH" # Script will exit here if pull fails, due to "set -e"

  echo "Successfully pulled changes. Deploying..."
  # The 'docker compose up -d --build' command will:
  # 1. Build images for services whose build context has changed.
  # 2. Stop and remove the *old* containers for services whose images or configuration have changed.
  # 3. Start *new* containers using the new images/configuration.
  # This approach minimizes downtime compared to bringing everything down with 'docker compose down' first.
  # --remove-orphans will clean up containers for services that are no longer defined in your docker-compose.yml.
  docker compose up -d --build --remove-orphans

  echo "Deployment complete. New containers should be up and running."
  # Consider adding a health check here for critical services before exiting.
else
  echo "No changes detected."
fi
exit 0