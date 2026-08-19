# CloudSafe

CloudSafe is a security monitoring platform that collects endpoint information, tracks asset health, receives security events, and provides a dashboard for monitoring cloud assets.

## Project Overview

CloudSafe consists of:

* Backend API built with Node.js, Express, TypeScript, Prisma, and PostgreSQL
* Frontend dashboard built with React, Ionic, TypeScript, and React Query
* Endpoint agent communication for:

  * Heartbeats
  * Asset inventory
  * Security event ingestion
  * Asset status tracking

The current build does **not** use Docker.

---

# Requirements

Install the following:

* Node.js (LTS recommended)
* Yarn
* PostgreSQL
* Git

Verify installations:

```bash
node -v
yarn -v
psql --version
```

---

# Project Structure

```
CloudSafe
|
├── server
│   ├── prisma
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── src
│   └── index.ts
|
└── client
    ├── src
    ├── pages
    ├── components
    └── App.tsx
```

---

# Backend Setup

Navigate to the server:

```bash
cd server
```

Install dependencies:

```bash
yarn install
```

---

## Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE cloudsafe;
```

Configure the database connection.

Create:

```
.env
```

Example:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cloudsafe"
```

---

## Prisma Setup

Generate Prisma client:

```bash
yarn prisma generate
```

Apply database schema:

```bash
yarn prisma migrate dev
```

If the database already contains the required tables:

```bash
yarn prisma db push
```

---

## Start Backend

Run development server:

```bash
yarn dev
```

The API will start on the configured backend port.

---

# Frontend Setup

Navigate to the frontend:

```bash
cd client
```

Install dependencies:

```bash
yarn install
```

---

## Start Frontend

Run:

```bash
yarn dev
```

The application will open in the browser.

---

# Authentication

CloudSafe uses token-based authentication.

Users can:

* Register an account
* Login
* Access protected dashboard pages
* Manage account settings

The frontend stores the authentication token locally and sends it with API requests.

---

# Dashboard

The dashboard provides:

## Security Overview

Displays:

* Total assets
* Events
* Alerts
* Critical findings

## Charts

Includes:

* Events over time
* Alerts by severity
* Asset status timeline

## Recent Activity

Displays:

* Recent security events
* Recent alerts
* Asset status changes

---

# Cloud Assets

Cloud Assets provides endpoint visibility.

Each asset displays:

* Asset name
* Hostname
* IP address
* Operating system
* CPU information
* Memory information
* Agent version
* Last heartbeat
* Last inventory update
* Current status

Supported statuses:

```
Active
Offline
```

---

# Agent Communication

Agents communicate with the backend through API endpoints.

## Heartbeat

Used to update:

* Last seen time
* Asset status
* Host information

Endpoint:

```
POST /agent/heartbeat
```

---

## Inventory

Updates:

* Operating system
* CPU count
* Memory
* Agent version

Endpoint:

```
POST /agent/inventory
```

---

## Security Events

Agents send security events through:

```
POST /agent/events
```

Events include:

* Event type
* Message
* Severity
* Source IP

---

# Asset Status Monitoring

CloudSafe automatically monitors heartbeat activity.

Behavior:

```
Active
 |
 | no heartbeat
 v
Offline
 |
 | heartbeat received
 v
Active
```

Status changes are recorded in:

```
Asset_Status_History
```

The timeline records:

* Previous status
* New status
* Timestamp
* Asset

---

# Logs

The Logs page displays security events collected from assets.

Features:

* Severity filtering
* Event details
* Source information
* Automatic refresh polling

---

# API Routes

Main API groups:

## Authentication

```
/api/register
/api/login
/api/logout
```

## Dashboard

```
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/events
GET /api/v1/dashboard/alerts
GET /api/v1/dashboard/recent
GET /api/v1/dashboard/status-history
```

## Assets

```
GET /api/v1/assets
GET /api/v1/assets/:id
GET /api/v1/assets/:id/status-history
PATCH /api/v1/assets/:id
DELETE /api/v1/assets/:id
```

## Agent

```
POST /api/v1/agent/heartbeat
POST /api/v1/agent/inventory
POST /api/v1/agent/events
```

---

# Development Workflow

Install dependencies:

```bash
yarn install
```

Run backend:

```bash
yarn dev
```

Run frontend:

```bash
yarn dev
```

Database changes:

1. Update:

```
prisma/schema.prisma
```

2. Generate Prisma client:

```bash
yarn prisma generate
```

3. Apply migration:

```bash
yarn prisma migrate dev
```

---

# Troubleshooting

## Prisma BigInt JSON Error

If PostgreSQL bigint fields cause:

```
Do not know how to serialize a BigInt
```

Convert bigint values before returning JSON:

```ts
value?.toString() || null
```

---

## Authentication Errors

If the application returns:

```
Invalid token
```

Log out and log back in to refresh the token.

---

## API 500 Errors

Check backend console output.

Common causes:

* Database connection issues
* Missing migrations
* Prisma schema mismatch
* Missing environment variables

---

# Current Build Notes

* Uses Yarn package management
* Uses PostgreSQL directly
* Does not use Docker
* Uses Prisma ORM
* Uses React Query for frontend polling
* Uses Ionic React UI components
* Asset heartbeat and status monitoring are implemented

---

# Future Improvements

Possible future additions:

* Agent management page
* Asset lifecycle controls
* Additional alert automation
* More SIEM integrations
* Advanced reporting

Members:
- Ligia, Prayash, Isaiah, Arwa

# AI Disclosure 
This project used AI only for extensive debugging and some formatting. The code produced was mainly made by the members involved, with the parts generated by AI being understood by all. The intent behind the code produced and the project as a whole is solely human, and will remain so
