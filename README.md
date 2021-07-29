# server_nodejs

Android Application, web 개발 nodejs 서버

## About this Project

localhost:3000 - ROUTE
localhost:4000 - REST
localhost:4000/api-docs - Swagger API-docs
localhost:8109 - logging
설명, 스크린샷 등등등

## How to Use

### Prerequisites

1. install Node.js [Official](https://nodejs.org/ko/download/)
2. install MongoDB [Official](https://docs.mongodb.com/manual/installation/)
3. install MongoDB-Tools [Official](https://docs.mongodb.com/database-tools/installation/installation/)
4. install npm packages
    ```sh
    npm -g nodemon node-sass
    ```
5. requires Firebase project [Official](https://console.firebase.google.com/?hl=ko)

### Installation

1. Clone the repo
    ```sh
    git clone https://github.com/nogardj3/server_nodejs
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Copy preference file
    ```sh
    cp ./preferences_sample.yaml ./preferences.yaml
    ```
4. Enter API key & values in preferences.yaml
5. Restore sample database
    ```sh
    mongorestore ./db_dump
    ```
6. Copy Firebase Admin SDK key file serviceAccountKey.json
    ```sh
    cp your_service_account_key.json ./serviceAccountKey.json
    ```
7. Run or test
    ```sh
    npm start
    npm test
    ```

## URLs