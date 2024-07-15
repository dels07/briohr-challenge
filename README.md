# BrioHR Technical Test

## Description

This is repository for BrioHR technical test.

## Technical Decision

I make this as extensible by creating collections for channels & notifications and giving relationship.
As for companies & user, I decide they can have subscribed channels as flags embedded to respective "documents".
When user doesn't have subscribed channels, it would fallback to default that company use.

### Key points

- use modular approach for each modules (companies, users, notifications).
- use mock data for companies & users.
- use seeder for notifications and channels.
- have three notifications (happy-birthday, leave-balance-reminder, monthly-payslip).
- have two channels (email, ui-only)
- use strategy pattern for notifications and channels.
- channel implementations differ depends on strategy used.
- test cases for possible user channels subscription & notifications already covered.
- test cases for exceptions already covered.

### Struggle and Improvements

- The code still tightly couple in module (esp. notification module) as I'm not to familiar with DI in NestJs.
- I checked there's an event emitter packages that can be use decouple service, but haven't tested it yet.
- I got some error when trying to run via docker regarding `class-validator` which require `moduleResolution: true` in `tsconfig.json`
- I have not succeed to modeling one-to-many relationship in mongoose, some code should be easier if I can utilize model relationship.

### Available endpoints
```bash
# health-check
GET http://localhost:3000/health-check

# notification histories by user
GET http://localhost:3000/notifications/histories/:userId

# create notification
POST http://localhost:3000/notifications
Body: {
  "user_id": {{user_id}}
  "company_id": {{company_id}},
  "notification_type": {{happy-birthday/leave-balance-reminder/monthly-payslip}}
}
```

## Installation

Clone the repo and `cd` into directory

### Docker Setup

```bash
# build docker image and orchestrate network with mongodb
$ docker-compose up --build

# seed data
$ npm run seed

# api can be checked at http://localhost:3000/health-check
```

### Local Setup, when having docker issue

```bash
# install dependencies
$ npm install

# only spun up mongodb image
$ docker-compose up --build mongodb

# copy env, adjust if necessary
$ cp .env.example .env

# seed data
$ npm run seed

# start development server
$ npm run start:dev

# api can be checked at http://localhost:3000/health-check
```

## Test

```bash
# unit tests
$ npm run test
```
