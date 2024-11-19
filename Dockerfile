# Step 1: Use an official Node.js runtime as a base image
FROM node:20-alpine3.20

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the rest of the application code into the container
COPY . .

# Step 6: Expose the port the app will run on
EXPOSE 3000

# Step 7: Command to run the app
CMD ["npm", "run", "dev"]