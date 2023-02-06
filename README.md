# Bank Reconciliation System

This project provides API for client to call via HTTP(s) protocolto import the transactions.

## Project structure

Diagram Architecture

![image](https://user-images.githubusercontent.com/105013929/216994634-8627de31-2e20-4314-a5ba-1e5d1db3f03e.png)

* This project is a microservices architecture using NestJS Framwork. These microservices communicate each other through TCP, Http protocal and RabbitMQ. Beside project also use cloud storage to store temporary file in order to handle sequential processing import file.
* Due to project can have handle file up to 1 millition of records, so this project will stream file to handle import record into database. Purpose project using RabbitMQ to handle sequential large file and avoid timeout client side when call API import file.
* Before client import transactions project also require client must be authorized this is to avoid large number of requests anonymous into service. 

There are packages used for read stream file from cloud storage and parse to import records:

* [`s3`]
  ([GitHub](https://github.com/andrewrk/node-s3-client)),
  Amazon S3 Client read/write into cloud storage.
* [`csv-parse`]
  ([GitHub](https://github.com/adaltas/node-csv/tree/master/packages/csv-parse)),
  a parser converting CSV text into arrays or objects.
* [`csv-parse`]
  ([GitHub](https://github.com/staeco/xlsx-parse-stream)),
  a parser converting XLSX nto arrays or objects.
* [`through2`]
  ([GitHub](https://github.com/rvagg/through2)),
 A tiny wrapper around Node.js streams.Transform (Streams2/3) to avoid explicit subclassing noise.
 
## Installation Instructions

* First build the image and run container components, make sure docker enviroment setuped on local machine:
![image](https://user-images.githubusercontent.com/105013929/217016075-7a02d63f-6f8f-492c-a801-23cf43af23db.png)
```bash
docker-compose up -d
```
* ImportDB (MySql) run by default on port `3308`
* AuthDB (MySql) run by default on port `3309`
* RabbitMQ run by default on port `5672` and `15672`

After start 3 service on these folder
![image](https://user-images.githubusercontent.com/105013929/217016198-e6bf847f-cb78-449f-9041-2cb7f0e981e8.png)
* Open terminal in problem-statement-import-service folder to start Import service on the command line:
```bash
npm install
```
```bash
npm run start:dev
```
Application will run by default on port `3001`

* Open terminal in problem-statement-handle-file-service folder to start Handle service on the command line:
```bash
npm install
```
```bash
npm run start:dev
```
Application will run by default on port `3000`

* Open terminal in problem-statement-auth-service folder to start Auth service on the command line:
```bash
npm install
```
```bash
npm run start:dev
```
Application will run by default on port `3002`

![image](https://user-images.githubusercontent.com/105013929/217011400-e7358211-872e-4f7d-86ed-893cb2ad5f81.png)

## API
This is list CURL to verify API:
* /auth/users: create user in order to authorize request.
* /auth/login: login with user created to get authentication token.
* /api/upload-file-import: API upload file for import transaction, client can choose file cvs, xlsx.
* /api/import-history/all: list all history import by client, client can check processing status.
* Link to Import Collection into Postman:
https://api.postman.com/collections/17096545-79dae1fb-7b01-482e-a51c-0b317b1dfa8f?access_key=PMAT-01GRKG2FCD900DS3AZBZHYMN07
