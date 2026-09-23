# Job Portal Project --- AI Codebase Context

> **Purpose:** This file is the persistent handoff/context document for
> AI coding sessions and developers working on this repository.
>
> **Critical rule:** This document describes the intended/current
> architecture, but the actual source code is the final source of truth.
> If this file conflicts with source code, inspect the source code and
> update this file rather than guessing.

------------------------------------------------------------------------

# 1. PROJECT IDENTITY

This repository is a recruitment/job-portal backend application.

## Core capabilities

-   User registration and login
-   JWT authentication
-   Candidate and recruiter workflows
-   Company management
-   Job posting and management
-   Job applications
-   Admin user-role management
-   Browser Web Push notifications
-   Notification persistence
-   Role-based authorization with CASL

## User roles

-   `CANDIDATE`
-   `RECRUITER`
-   `ADMIN`
-   `SUPER_ADMIN`

------------------------------------------------------------------------

# 2. NON-NEGOTIABLE ENGINEERING RULES

These rules must be followed unless the user explicitly asks to change
the architecture.

1.  Do not rewrite existing architecture unnecessarily.
2.  Do not replace Prisma with raw SQL unless explicitly requested.
3.  PostgreSQL is the current database.
4.  Prisma is the ORM and the primary database access layer.
5.  Backend uses JavaScript with CommonJS modules.
6.  Do not introduce TypeScript into the backend unless explicitly
    requested.
7.  Routes define paths and middleware; they should not contain business
    logic.
8.  Controllers handle HTTP concerns only.
9.  Services contain business logic and Prisma/database operations.
10. Authentication uses Passport/JWT.
11. Authorization uses CASL and the existing authorization middleware.
12. Do not bypass CASL with ad-hoc role checks unless explicitly
    required.
13. Do not trust ownership/user IDs supplied by clients when the
    authenticated user can be identified from `req.user`.
14. Existing resource-based authorization must use `req.resource` where
    required by `authorize.js`.
15. Never expose private secrets to the frontend.
16. Never commit `.env` or secrets to Git.
17. Do not modify Prisma migration history casually.
18. Before changing an existing file, inspect its current implementation
    and its callers.
19. Make the smallest change required by the task.
20. Do not modify unrelated files just because they can be improved.
21. Preserve existing API contracts unless the task explicitly requires
    a breaking change.
22. If unsure about an existing function, search the repository before
    creating a duplicate.
23. Do not assume a file/function exists only because it is mentioned in
    this document.
24. When a task is complete, update the `CURRENT WORK` and `CHANGE LOG`
    sections.

------------------------------------------------------------------------

# 3. SOURCE-OF-TRUTH ORDER

When information conflicts, use this order:

1.  Actual source code
2.  `prisma/schema.prisma`
3.  Prisma migration history/database state
4.  Tests
5.  API/Postman collection
6.  This `context.md`
7.  AI assumptions

Never change the code merely to make it match an outdated context
document.

------------------------------------------------------------------------

# 4. TECH STACK

## Backend

-   Node.js
-   Express.js
-   JavaScript
-   CommonJS modules

## Database

-   PostgreSQL
-   Prisma ORM

## Authentication

-   JWT
-   Passport.js
-   HTTP-only JWT cookie and/or Authorization header according to the
    existing Passport strategy

## Authorization

-   `@casl/ability`
-   CASL `AbilityBuilder`
-   `createMongoAbility`
-   Custom `authorize.js`
-   Resource-based authorization through `req.resource`

## Other dependencies/features

-   `bcrypt`
-   `cookie-parser`
-   `cors`
-   `express-validator`
-   `web-push`
-   Nodemon for development

## Frontend integration

-   Next.js frontend
-   Browser Service Worker
-   Web Push API

------------------------------------------------------------------------

# 5. PROJECT STRUCTURE

Expected important structure:

``` text
/
├── server.js
├── package.json
├── prisma.config.ts
├── .env
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.js
│
└── src/
    ├── app.js
    ├── prisma.js
    ├── passport.js
    │
    ├── passport/
    │   └── jwt.strategy.js
    │
    ├── routes/
    ├── controllers/
    ├── services/
    ├── middleware/
    ├── validators/
    └── config/
        └── webpush.js
```

Important files:

``` text
server.js
src/app.js
src/prisma.js
src/passport.js
src/passport/jwt.strategy.js
src/middleware/ability.js
src/middleware/authorize.js
src/config/webpush.js
prisma/schema.prisma
```

------------------------------------------------------------------------

# 6. APPLICATION BOOT FLOW

## `server.js`

The server starts the Express application.

Conceptually:

``` text
server.js
   ↓
dotenv
   ↓
src/app.js
   ↓
Express server
   ↓
port 5000
```

Development:

``` bash
npm run dev
```

Production:

``` bash
npm start
```

------------------------------------------------------------------------

# 7. `src/app.js`

`src/app.js` is responsible for:

-   Express initialization
-   CORS
-   JSON parsing
-   Cookie parsing
-   Passport initialization
-   Static files
-   Route mounting
-   Global error handling

JSON parsing must occur before routes that expect JSON request bodies:

``` js
app.use(express.json());
```

Current frontend development origin:

``` text
http://localhost:3000
```

Current backend port:

``` text
5000
```

------------------------------------------------------------------------

# 8. API MOUNT POINTS

Current API structure:

``` text
/api/auth
/api/users
/api/jobs
/api/companies
/api
/api/admin
/api/notifications
```

Important routes:

``` text
/api/auth/register
/api/auth/login
/api/auth/profile
/api/auth/logout

/api/jobs
/api/jobs/:id
/api/jobs/:jobId/apply

/api/companies
/api/companies/me
/api/companies/:id

/api/my

/api/users

/api/admin/users/:userId/role

/api/notifications/subscribe
/api/notifications/send
```

------------------------------------------------------------------------

# 9. DATABASE --- PRISMA

Primary schema:

``` text
prisma/schema.prisma
```

Current provider:

``` text
PostgreSQL
```

Prisma is the application's primary database access layer.

Do not assume database-specific behavior is irrelevant: Prisma abstracts
normal CRUD, but PostgreSQL still affects migrations, field types,
indexes, constraints, transactions, and database behavior.

------------------------------------------------------------------------

# 10. DATABASE ENUMS

## UserRole

``` text
CANDIDATE
RECRUITER
ADMIN
SUPER_ADMIN
```

## JobType

``` text
FULL_TIME
PART_TIME
INTERNSHIP
CONTRACT
```

## JobStatus

``` text
DRAFT
OPEN
CLOSED
```

## ApplicationStatus

``` text
APPLIED
SHORTLISTED
REJECTED
HIRED
```

------------------------------------------------------------------------

# 11. DATABASE MODELS

## User

Core fields:

``` text
id
name
email
password
googleId
role
createdAt
updatedAt
```

Relationships:

``` text
company
jobs
applications
refreshTokens
pushSubscriptions
notifications
```

------------------------------------------------------------------------

## Company

Fields:

``` text
id
name
description
website
location
createdAt
updatedAt
ownerId
```

Relationship:

``` text
owner → User
jobs → Job[]
```

`ownerId` identifies the recruiter who owns the company.

------------------------------------------------------------------------

## Job

Fields:

``` text
id
title
description
location
salaryMin
salaryMax
jobType
status
skills
createdAt
updatedAt
companyId
recruiterId
```

Relationships:

``` text
company → Company
recruiter → User
applications → Application[]
```

------------------------------------------------------------------------

## Application

Fields:

``` text
id
coverLetter
resumeUrl
status
createdAt
updatedAt
jobId
candidateId
```

Constraint:

``` text
unique(jobId, candidateId)
```

This prevents the same candidate from applying to the same job more than
once.

------------------------------------------------------------------------

## RefreshToken

-   Stores hashed refresh tokens.
-   Belongs to a user.

------------------------------------------------------------------------

## PushSubscription

Purpose:

Stores the browser Web Push subscription required to deliver push
notifications.

Important fields:

``` text
id
userId
endpoint
p256dh
auth
createdAt
updatedAt
```

Relationship:

``` text
PushSubscription → User
```

One user may have multiple subscriptions because a user may use multiple
browsers/devices.

------------------------------------------------------------------------

## Notification

Purpose:

Stores notification history and read/unread state.

Fields:

``` text
id
userId
title
message
url
isRead
createdAt
updatedAt
```

Relationship:

``` text
Notification → User
```

Important distinction:

``` text
PushSubscription
    = where/how to deliver a browser push

Notification
    = business notification/history
```

------------------------------------------------------------------------

# 12. AUTHENTICATION

Authentication uses JWT and Passport.

## Register

``` http
POST /api/auth/register
```

Typical input:

``` json
{
  "name": "...",
  "email": "...",
  "password": "..."
}
```

Flow:

``` text
Request
  ↓
Validation
  ↓
Check existing email
  ↓
bcrypt hash
  ↓
Create User
  ↓
Generate JWT
  ↓
Return user/token
  ↓
Set HTTP-only cookie
```

------------------------------------------------------------------------

## Login

``` http
POST /api/auth/login
```

Flow:

``` text
email/password
  ↓
find User
  ↓
bcrypt.compare
  ↓
generate JWT
  ↓
return user/token
  ↓
set cookie
```

------------------------------------------------------------------------

## Profile

``` http
GET /api/auth/profile
```

Protected by Passport JWT.

The authenticated user is available through:

``` js
req.user
```

The JWT payload contains:

``` text
id
role
```

------------------------------------------------------------------------

## Logout

``` http
POST /api/auth/logout
```

Clears the authentication cookie according to the existing
implementation.

------------------------------------------------------------------------

# 13. AUTHORIZATION --- CASL

Authorization source:

``` text
src/middleware/ability.js
```

Authorization enforcement:

``` text
src/middleware/authorize.js
```

The existing authorization pattern must be preserved.

------------------------------------------------------------------------

# 14. CURRENT CASL RULES

## Candidate

Candidate can:

``` text
read Job
create Application
read own Application
read own Notification
update own Notification
create own PushSubscription
delete own PushSubscription
```

Ownership condition uses:

``` js
{
  userId: user.id
}
```

for notifications/subscriptions.

------------------------------------------------------------------------

## Recruiter

Recruiter can:

``` text
create Company
read own Company
read Job
create Job
update own Job
update own Company
delete own Job
read Application
read/update own notifications as currently defined
manage own push subscriptions as currently defined
```

Ownership is determined through the appropriate resource fields.

------------------------------------------------------------------------

## Admin

Admin currently has:

``` js
can("manage", "all");
```

with the existing restriction that an admin cannot update themselves
through the user-role mechanism.

------------------------------------------------------------------------

## Super Admin

Super Admin currently has:

``` js
can("manage", "all");
```

------------------------------------------------------------------------

# 15. `authorize.js` BEHAVIOR

Existing authorization middleware follows this pattern:

``` text
authorize(action, subjectName)
```

For `create`:

``` text
check ability directly against subjectName
```

For existing resources:

``` text
req.resource
   ↓
subject(subjectName, resource)
   ↓
ability.can(action, resourceSubject)
```

Therefore, ownership-sensitive routes must load the resource before
authorization.

Important:

``` text
Do not replace resource-based authorization with a generic role check.
```

------------------------------------------------------------------------

# 16. ROUTE / CONTROLLER / SERVICE ARCHITECTURE

The project follows:

``` text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

## Routes

Responsibilities:

-   URL definitions
-   HTTP methods
-   Authentication middleware
-   Authorization middleware
-   Resource loading middleware
-   Validation middleware

Routes should not contain business logic.

## Controllers

Responsibilities:

-   Read `req`
-   Call service
-   Return `res`
-   Pass errors to `next`

Controllers should not contain large Prisma/business operations.

## Services

Responsibilities:

-   Business logic
-   Prisma queries
-   Transactions when necessary
-   External service integrations
-   Notification delivery logic

------------------------------------------------------------------------

# 17. RESPONSE FORMAT

The project generally uses:

``` json
{
  "success": true,
  "message": "...",
  "data": {},
  "pagination": {}
}
```

Errors commonly use:

``` text
statusCode
message
```

and are handled centrally.

Do not introduce a completely different response structure for a new
endpoint without a reason.

------------------------------------------------------------------------

# 18. VALIDATION

Request validation is handled through the existing validator system:

``` text
src/validators/
```

Known components include:

``` text
validators.js
validationHnadler.js
```

Use the existing validation conventions rather than creating a second
validation approach.

------------------------------------------------------------------------

# 19. ERROR HANDLING

Global error handling is mounted by `src/app.js`.

Common statuses:

``` text
401 → authentication failure
403 → access denied
404 → resource not found
409 → conflict/duplicate
422 → validation error when used by current convention
500 → unexpected server error
```

Controllers should pass errors to:

``` js
next(error)
```

Do not duplicate the entire global error handler inside controllers.

------------------------------------------------------------------------

# 20. JOB BUSINESS LOGIC

## Create Job

Endpoint:

``` http
POST /api/jobs
```

Recruiter-only workflow.

Current business requirements:

1.  Authenticate recruiter.
2.  Validate input.
3.  Verify company exists.
4.  Verify recruiter owns the company.
5.  Create job linked to:
    -   `companyId`
    -   `recruiterId`
6.  Return created job.
7.  If notification is required, trigger notification AFTER successful
    job creation.

Important:

``` text
Job creation and push subscription registration are separate concerns.
```

------------------------------------------------------------------------

# 21. JOB LISTING

Endpoint:

``` http
GET /api/jobs
```

Current behavior:

-   Pagination
-   Search
-   Location
-   Job type
-   Salary minimum
-   Only `OPEN` jobs are listed

Typical parameters:

``` text
page
limit
search
location
jobType
salaryMin
```

Default:

``` text
page = 1
limit = 10
```

------------------------------------------------------------------------

# 22. APPLICATION FLOW

Endpoint:

``` http
POST /api/jobs/:jobId/apply
```

Business rules:

1.  Job must exist.
2.  Job must be `OPEN`.
3.  Candidate must be authenticated.
4.  Candidate cannot apply twice to the same job.
5.  Application is stored with candidate and job references.

------------------------------------------------------------------------

# 23. COMPANY FLOW

Recruiters can create and manage their own company.

Important ownership rule:

``` text
company.ownerId === req.user.id
```

A recruiter should not be able to update another recruiter's company.

------------------------------------------------------------------------

# 24. WEB PUSH ARCHITECTURE

Web Push is implemented using:

``` text
web-push
Browser Push API
Service Worker
VAPID
PostgreSQL
```

High-level flow:

``` text
Frontend
  ↓
Register Service Worker
  ↓
Request notification permission
  ↓
pushManager.subscribe()
  ↓
Browser creates PushSubscription
  ↓
POST /api/notifications/subscribe
  ↓
Backend associates subscription with req.user.id
  ↓
PostgreSQL
```

Later:

``` text
Business Event
  ↓
Notification Service
  ↓
Create Notification record
  ↓
Find user's PushSubscription(s)
  ↓
webpush.sendNotification()
  ↓
Browser Push Service
  ↓
Service Worker
  ↓
Browser notification
```

------------------------------------------------------------------------

# 25. VAPID SECURITY

Backend environment contains:

``` text
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

Frontend may receive:

``` text
VAPID_PUBLIC_KEY
```

Frontend must NEVER receive:

``` text
VAPID_PRIVATE_KEY
```

`VAPID_SUBJECT` is a VAPID contact/identity value. It does NOT
automatically send email.

The VAPID subject email is not an email notification system.

------------------------------------------------------------------------

# 26. PUSH SUBSCRIPTION FLOW

Endpoint:

``` http
POST /api/notifications/subscribe
```

Authentication:

``` text
JWT required
```

The browser sends a real PushSubscription containing:

``` json
{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

The backend must determine the user from:

``` js
req.user.id
```

Do not trust a client-supplied `userId` for subscription ownership.

Service behavior:

1.  Validate endpoint.
2.  Validate `p256dh`.
3.  Validate `auth`.
4.  Check whether the endpoint already exists for the user.
5.  Update existing subscription or create a new one.
6.  Return the saved subscription information according to the existing
    response convention.

------------------------------------------------------------------------

# 27. NOTIFICATION SEND FLOW

Current endpoint:

``` http
POST /api/notifications/send
```

A typical target notification request contains:

``` json
{
  "userId": 4,
  "title": "New Job",
  "message": "A new job is available.",
  "url": "/jobs/123"
}
```

Here:

``` text
req.user.id
    = authenticated sender

body.userId
    = target/recipient
```

Do not confuse these two concepts.

The endpoint must be protected by appropriate authorization. A normal
authenticated user must not automatically gain the ability to send
arbitrary notifications to other users.

------------------------------------------------------------------------

# 28. NOTIFICATION SERVICE

The notification service is responsible for:

1.  Creating a `Notification` database record.
2.  Finding the recipient's push subscriptions.
3.  Building the push payload.
4.  Calling `webpush.sendNotification()`.
5.  Handling stale subscriptions.
6.  Removing subscriptions when the push provider reports `404` or
    `410`.

Conceptually:

``` text
sendNotification()
    ↓
Notification.create()
    ↓
PushSubscription.findMany()
    ↓
for each subscription
    ↓
webpush.sendNotification()
    ↓
404/410?
    ↓
delete stale subscription
```

------------------------------------------------------------------------

# 29. BUSINESS EVENT NOTIFICATIONS

`/subscribe` is NOT the trigger for business notifications.

`/subscribe` means:

``` text
"Register this browser so it can receive future notifications."
```

A business event triggers a notification.

Example:

``` text
Recruiter posts job
       ↓
Job successfully created
       ↓
Notification Service
       ↓
Find eligible candidates
       ↓
Create notification records
       ↓
Send Web Push
```

Other possible business events:

``` text
Application submitted
Application shortlisted
Application rejected
Candidate hired
Interview scheduled
New job posted
```

When implementing an event, trigger notification logic AFTER the primary
business operation succeeds unless the requirements explicitly demand
another transaction/outbox strategy.

------------------------------------------------------------------------

# 30. FRONTEND WEB PUSH FLOW

Next.js frontend responsibilities:

``` text
1. Register /sw.js
2. Ask Notification permission
3. Get VAPID public key
4. Call pushManager.subscribe()
5. Send PushSubscription to backend
6. Service Worker listens for push events
7. Service Worker displays notification
8. notificationclick opens the configured URL
```

The frontend must not contain the VAPID private key.

------------------------------------------------------------------------

# 31. SERVICE WORKER

Expected frontend service worker:

``` text
public/sw.js
```

It handles:

``` text
push
notificationclick
```

The service worker should parse the push payload and call:

``` text
self.registration.showNotification(...)
```

Do not move server-side VAPID/private-key logic into the service worker.

------------------------------------------------------------------------

# 32. NOTIFICATION DATA MODEL VS DELIVERY MODEL

These are intentionally separate.

## Notification

Answers:

``` text
What happened?
Who should see it?
Is it read?
Where should the user navigate?
```

## PushSubscription

Answers:

``` text
Where can this browser receive the push?
```

One user may have:

``` text
User
 ├── Chrome subscription
 ├── Edge subscription
 └── another browser/device subscription
```

Therefore notification sending may need to send to multiple
subscriptions.

------------------------------------------------------------------------

# 33. IMPORTANT CURRENT API CONTRACT

## Subscribe

``` http
POST /api/notifications/subscribe
Authorization: Bearer <JWT>
Content-Type: application/json
```

Body:

``` json
{
  "endpoint": "...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

User identity comes from:

``` text
req.user.id
```

------------------------------------------------------------------------

## Send

``` http
POST /api/notifications/send
Authorization: Bearer <JWT>
Content-Type: application/json
```

Example:

``` json
{
  "userId": 4,
  "title": "New Job",
  "message": "A new job is available.",
  "url": "/jobs/123"
}
```

Authorization must be enforced according to the current CASL policy.

------------------------------------------------------------------------

## Future notification history API

Expected:

``` http
GET /api/notifications
```

Should return notifications belonging to the authenticated user.

------------------------------------------------------------------------

## Future mark-read API

Expected:

``` http
PATCH /api/notifications/:id/read
```

Must only allow the owner of the notification to modify it.

This should use the existing resource-loading + CASL pattern.

------------------------------------------------------------------------

# 34. IMPORTANT SECURITY RULES

Never expose:

``` text
DATABASE_URL
DB_PASSWORD
JWT_SECRET
VAPID_PRIVATE_KEY
ADMIN_PASSWORD
```

Frontend may expose:

``` text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
```

Never trust:

``` text
body.userId
body.ownerId
body.recruiterId
```

when the value should come from the authenticated user.

Always verify ownership/business rules server-side.

------------------------------------------------------------------------

# 35. ENVIRONMENT

Backend development:

``` text
PORT=5000
```

Frontend development:

``` text
http://localhost:3000
```

Backend database:

``` text
PostgreSQL
```

The exact secrets and credentials must remain in `.env` and must not be
copied into this context file.

Do not store real secret values in `context.md`.

------------------------------------------------------------------------

# 36. TESTING CONVENTIONS

Primary API testing tool:

``` text
Postman
```

For authenticated requests:

``` text
Authorization: Bearer <JWT>
```

or use the existing cookie authentication mechanism according to the
endpoint/Passport strategy.

For JSON:

``` text
Content-Type: application/json
```

For Web Push:

1.  Open frontend in a browser.
2.  Register Service Worker.
3.  Grant notification permission.
4.  Generate real browser PushSubscription.
5.  POST it to `/api/notifications/subscribe`.
6.  Verify the database record.
7.  Trigger `/api/notifications/send` or a real business event.
8.  Verify the browser notification.
9.  Verify the Notification database record.

Do not manually invent `endpoint`, `p256dh`, or `auth` values and expect
actual push delivery.

------------------------------------------------------------------------

# 37. CURRENT WORK

## Jira Task

Implement browser Web Push Notification System.

## Completed

-   [x] Web Push architecture defined
-   [x] `PushSubscription` Prisma model
-   [x] `Notification` Prisma model
-   [x] PostgreSQL migration
-   [x] `web-push` dependency
-   [x] VAPID configuration
-   [x] `src/config/webpush.js`
-   [x] Notification service foundation
-   [x] Notification controller foundation
-   [x] Notification routes foundation
-   [x] CASL notification permissions
-   [x] Existing `authorize.js` reviewed
-   [x] `POST /api/notifications/subscribe`
-   [x] Browser PushSubscription persisted successfully
-   [x] Next.js Service Worker foundation
-   [x] Next.js VAPID public-key integration
-   [x] Recruiter can read applications for their own jobs
-   [x] Recruiter can update application status for their own jobs

## Verified

The subscription endpoint has successfully returned a response similar
to:

``` json
{
  "success": true,
  "message": "Push subscription saved successfully"
}
```

and the database contained:

``` text
userId
endpoint
p256dh
auth
createdAt
updatedAt
```

## Remaining

-   [ ] Verify actual browser push delivery end-to-end.
-   [ ] Protect `/send` using the correct CASL authorization policy.
-   [ ] Connect notification triggering to job creation.
-   [ ] Decide which users should receive a new-job notification.
-   [ ] Implement `GET /api/notifications`.
-   [ ] Implement `PATCH /api/notifications/:id/read`.
-   [ ] Add notification deletion/cleanup if required.
-   [ ] Integrate notification UI into Next.js.
-   [ ] Add tests.
-   [ ] Review stale subscription handling.
-   [ ] Review duplicate subscription behavior.
-   [ ] Add recruiter application filtering / sorting by status.
-   [ ] Add candidate-facing application tracking UI.

------------------------------------------------------------------------

# 38. CURRENT NOTIFICATION DESIGN DECISION

Important architectural decision:

``` text
/subscribe
    ≠
send notification
```

Instead:

``` text
/subscribe
    ↓
register browser delivery target

Business event
    ↓
notification service
    ↓
send push
```

For example:

``` text
POST /api/jobs
    ↓
create job
    ↓
notification.service.sendNotification(...)
```

This keeps the notification system reusable across jobs, applications,
interviews, and other events.

------------------------------------------------------------------------

# 39. KNOWN RISKS / AREAS TO REVIEW

These are known areas that should be reviewed without unnecessarily
rewriting them:

1.  Authorization edge cases.
2.  Ownership enforcement.
3.  Admin endpoint protection.
4.  Notification recipient selection.
5.  Multiple browser subscriptions per user.
6.  Stale push subscriptions.
7.  Consistent API response format.
8.  Validation coverage.
9.  Test coverage.
10. Production Web Push configuration.
11. Environment/secrets management.
12. Frontend/backend authentication integration.

------------------------------------------------------------------------

# 40. DO NOT ASSUME

The next AI must NOT assume:

-   A file exists because this document mentions it.
-   An endpoint is implemented because it appears in this document.
-   A middleware signature is different from the actual source.
-   A Prisma model exactly matches this document without inspecting
    `schema.prisma`.
-   The frontend stores JWT in localStorage.
-   The frontend authentication implementation matches an example.
-   `/send` is safe for all authenticated users.
-   `/subscribe` should be called every time a job is posted.
-   VAPID `publicKey` is the same as a subscription's `p256dh`.
-   `VAPID_SUBJECT` sends email.
-   A browser push subscription can be fabricated manually for real
    delivery.

Always inspect the actual source before making changes.

------------------------------------------------------------------------

# 41. AI CHANGE PROTOCOL

When asked to implement a new feature:

## Step 1 --- Understand

Read:

``` text
context.md
```

Then inspect the relevant source files.

## Step 2 --- Trace

Trace:

``` text
route
 → middleware
 → controller
 → service
 → Prisma
```

and any external integration.

## Step 3 --- Check existing patterns

Look for an existing feature that follows the same architecture.

Reuse established patterns.

## Step 4 --- Plan

Before editing, identify:

``` text
Files to modify
Files to create
Database changes
API changes
Authorization changes
Frontend contract changes
```

## Step 5 --- Implement minimally

Do not refactor unrelated code.

## Step 6 --- Verify

Run relevant:

``` text
lint/tests
Prisma validation/generate/migration checks when needed
Postman API tests
frontend/browser tests when applicable
```

## Step 7 --- Update context

Update:

``` text
CURRENT WORK
CHANGE LOG
KNOWN ISSUES
NEXT STEP
```

------------------------------------------------------------------------

# 42. AI SESSION HANDOFF

Before ending a coding session, update this section.

## Current session

``` text
Date:
Task:
Status:
```

## Files changed

``` text
-
-
-
```

## Database changes

``` text
-
```

## API changes

``` text
-
```

## Verified

``` text
-
```

## Not verified

``` text
-
```

## Known errors

``` text
-
```

## Exact next step

``` text
-
```

The next AI must start from this state rather than restarting the
implementation.

------------------------------------------------------------------------

# 43. CHANGE LOG

## 2026-09-23 --- Web Push Notification System

Implemented/focused on:

-   Push subscription persistence
-   Notification model
-   Web Push/VAPID configuration
-   Notification service
-   Notification controller
-   Notification routes
-   CASL notification permissions
-   Next.js Service Worker integration
-   Frontend VAPID public key integration
-   Postman subscription testing

Verified:

-   `/api/notifications/subscribe` successfully saved a browser
    subscription for an authenticated user.

Important discovery:

-   The VAPID public key is different from the browser-generated
    `p256dh` subscription key.
-   `VAPID_PRIVATE_KEY` must remain backend-only.
-   `/subscribe` registers the browser; it is not the trigger for a job
    notification.

Next:

-   Complete real push delivery test.
-   Trigger notification from successful job creation.
-   Complete notification history/read APIs.
-   Complete frontend notification UI.

------------------------------------------------------------------------

# 44. FUTURE ROADMAP

Potential future work:

-   Candidate profile management
-   Resume upload
-   Recruiter dashboard
-   Applicant tracking
-   Job analytics
-   Email verification
-   Forgot password
-   Password reset
-   Production PostgreSQL configuration
-   Docker
-   CI/CD
-   Automated tests
-   Production Web Push configuration
-   Notification preferences
-   Notification categories
-   Notification read/unread counts

------------------------------------------------------------------------

# 45. QUICK AI REFERENCE

If the next AI has only one minute, remember:

``` text
PROJECT
Job Portal backend

STACK
Node.js + Express + JavaScript/CommonJS
Prisma + PostgreSQL
Passport JWT
CASL
web-push
Next.js frontend

ARCHITECTURE
Routes → Middleware → Controllers → Services → Prisma → PostgreSQL

AUTH
Passport JWT
req.user contains authenticated user

AUTHORIZATION
CASL
ability.js = rules
authorize.js = enforcement
resource-based checks use req.resource

ROLES
CANDIDATE
RECRUITER
ADMIN
SUPER_ADMIN

PUSH
/subscribe = register browser
Business event = trigger notification
web-push = delivery
Service Worker = browser-side receiver

SECURITY
VAPID_PUBLIC_KEY → frontend allowed
VAPID_PRIVATE_KEY → backend only
JWT_SECRET → backend only
DATABASE credentials → backend only

CURRENT FEATURE
Web Push Notification System

CURRENT NEXT STEP
Finish end-to-end push delivery and connect notifications to successful job creation.

DO NOT
Rewrite architecture
Bypass CASL
Trust client ownership IDs
Expose secrets
Invent missing files/functions
Change unrelated code
```

------------------------------------------------------------------------

# 46. FINAL HANDOFF PRINCIPLE

The purpose of this document is not to replace reading the repository.

It is to prevent an AI session from losing:

-   architecture decisions
-   current implementation status
-   security rules
-   API contracts
-   business rules
-   unfinished work
-   known issues
-   exact next steps

When continuing work, the AI should use this document to understand the
project quickly, then inspect the actual relevant source files before
editing anything.
