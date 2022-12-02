# Rapid
An online app to build extensions on the cloud using blocks!
## Cloning
To get started with Rapid sources. You need to fork & clone the sources locally.
```bash
git clone https://github.com/USERNAME/rapid-sources
cd rapid-sources
git remote add upstream https://github.com/Rapid1/rapid-sources
git submodule update --init
```
## Preparing
You need to prepare some softwares and tools first for Rapid to work properly
### 1- MongoDB
You must install MongoDB on your device. Then, make sure it's running using:
```bash
mongod --dbpath SOME_PATH
```
### 2- Firebase
Please create a firebase project for your rapid fork. And download the google service account private key as explained here:
https://firebase.google.com/docs/admin/setup#initialize-sdk
And move it to the api directory.
### 3- SMTP
To receive emails, you must have an SMTP server. Then modify the configuration for the nodemailer (https://github.com/Rapid-org/rapid-sources/blob/ce9328a7d246cbe386540a36dce7f7a61613ee71/api/controllers/mailControllers.js#L186)[here]
Additionaly, you have to create a credentials.json file in the api directory with the following structure:
```json
{
  "email": "SMTP_EMAIL",
  "password": "SMTP_PASSWORD"
}

```
Note: for testing purposes, you could use email providers as SMTP. ex.: GMail.
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
