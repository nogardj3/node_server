# server_nodejs

개발한 Android, Web 어플리케이션 구동에 사용되는 nodejs 서버

## About this Project

### REST (3000)

1. 클라이언트의 데이터를 Local Database에 저장 및 필요 데이터 제공
2. Open API 데이터를 중개하여 클라이언트에 제공
3. Android/iOS Firebase Cloud Messaging 서버 기능
4. Swagger - API Documentation tool 제공  
   ![swagger.jpg](https://github.com/nogardj3/server_nodejs/screenshot/swagger.jpg?raw=true)

### LOGGING (8109)

1. 필요한 정보를 서버에 직접 기록
2. info, error 등 분리기록, 수명 관리

### 🚧ROUTE (4000)

1. reactjs, angularjs Web 어플리케이션 구동에 필요한 Routing 기능을 제공

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

## 활용기술

-   [Typescript](https://www.typescriptlang.org/)
-   [MongoDB](https://www.mongodb.com/)
-   [Express](https://expressjs.com/ko/)
-   [Swagger](https://swagger.io/) REST API documentation tool
-   [Puppeteer](https://github.com/puppeteer/puppeteer) Naver QR Code checkin에 사용
-   [Firebase-admin](https://console.firebase.google.com/?hl=ko) Firebase Cloud Message 서비스 구축을 위해 사용
