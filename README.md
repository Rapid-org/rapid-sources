# Rapid
An online app to build extensions on the cloud using blocks!

## Building
Rapid are built on multiple parts, the `client`, `buildserver` and `api`.
### Building the Client Module
The client is written in ReactJS, to run it, you will need to do the following:
```bash
# cd to the client-react directory
cd client/
# Install Dependencies
npm install
# Start The Main Server
npm run start
```
Done! The client module is running at `http://localhost:3000`

If you do changes to any of the blockly modules, most essentially the `core`, `blocks`, `msg`, and `generators` modules, you will need to rebuild blockly using
```bash
# cd to the client directory
cd client/
# Install Dependencies
npm install
# Build Blockly
npm run build
```
Note: It's required to have NPM installed on your Device.
### Building & Running the Buildserver Module
The buildserver modules is written with kotlin, and built using the Gradle build system. To build, use the following command
```bash
# cd to the buildserver directory
cd buildserver/
## Build the BuildServer
gradle build
## Run the BuildServer
gradle run
```
Note: It's required to have JDK 8 & Gradle installed on your device.
The API should be running at http://localhost:8080
### Building & Running the API Module
The API modules is written in NodeJS, you can build it using:
```bash
# Create Data directory for mongoDB
mkdir mongo/data
# Start mongoDB
mongod --dbpath mongo/data
# cd to the api directory
cd api/
# Install Dependencies
npm install
# Start the API
npm run start
```
Note: It's required to have NPM, NodeJS, MongoDB installed on your Device.
The API should be running at http://localhost:9980
