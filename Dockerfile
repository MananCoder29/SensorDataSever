# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files to the image
COPY package*.json ./

# Install the app dependencies
RUN npm ci
RUN npm install -g nodemon
#RUN apk add git

# Copy the rest of the app files to the image
COPY . .

# Specify the command to run when the container starts
CMD [ "nodemon" ]