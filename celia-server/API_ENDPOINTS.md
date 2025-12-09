# CELIA API Endpoints Reference

Complete reference for all API endpoints with request/response examples.

Base URL: `http://localhost:3000/api`

## Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "john.doe@stanford.edu",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "collegeName": "Stanford University",
  "major": "Computer Science",
  "graduationYear": 2025,
  "bio": "Hey there! I love hiking and meeting new people. Always down for a coffee chat!",
  "interests": ["Sports & Fitness", "Technology & Gaming", "Food & Cooking"],
  "preferredLocations": ["Stanford, CA", "San Francisco, CA"]
}
```

**Response (201)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "john.doe@stanford.edu",
    "fullName": "John Doe",
    "profileCompleted": true,
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@stanford.edu",
  "password": "SecurePassword123"
}
```

**Response (200)**:
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "john.doe@stanford.edu",
  "fullName": "John Doe",
  ...
}
```

---

## Users

### Get All Users

```http
GET /users?search=john&interests=Sports,Gaming&college=Stanford
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `search` (optional): Search by name, college, or major
- `interests` (optional): Comma-separated list of interests
- `college` (optional): Filter by college name

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "email": "john.doe@stanford.edu",
    "fullName": "John Doe",
    "collegeName": "Stanford University",
    "major": "Computer Science",
    "interests": ["Sports & Fitness", "Technology & Gaming"],
    ...
  }
]
```

### Get User by ID

```http
GET /users/:id
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "id": "uuid",
  "email": "john.doe@stanford.edu",
  "fullName": "John Doe",
  "_count": {
    "hostedEvents": 5,
    "eventAttendances": 12
  },
  ...
}
```

### Update User Profile

```http
PATCH /users/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "bio": "Updated bio text with at least 50 characters for validation to pass",
  "interests": ["New Interest 1", "New Interest 2", "New Interest 3"],
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "bio": "Updated bio...",
  "interests": ["New Interest 1", "New Interest 2", "New Interest 3"],
  ...
}
```

### Get User Statistics

```http
GET /users/:id/stats
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "hostedEvents": 5,
  "attendedEvents": 12,
  "receivedInvitations": 20,
  "sentInvitations": 15
}
```

### Get User Events

```http
GET /users/:id/events?type=hosted
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `type` (optional): `hosted` or `attending` (default: `hosted`)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Weekend Hiking Trip",
    "eventDate": "2024-12-25",
    "status": "active",
    "category": { "name": "Outdoor Activity" },
    "_count": {
      "attendees": 15,
      "invitations": 30
    },
    ...
  }
]
```

---

## Events

### Create Event

```http
POST /events
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Weekend Hiking Trip",
  "description": "Join us for an amazing hiking adventure in the mountains! We will explore beautiful trails and enjoy nature together.",
  "categoryId": "category-uuid",
  "locationName": "Stanford Dish Trail",
  "locationLat": 37.4019,
  "locationLng": -122.1430,
  "eventDate": "2024-12-25",
  "startTime": "2024-12-25T09:00:00Z",
  "endTime": "2024-12-25T15:00:00Z",
  "photoUrls": ["https://example.com/photo1.jpg"],
  "interestTags": ["Outdoor Activities", "Sports & Fitness"],
  "capacityLimit": 20,
  "isPublic": true,
  "status": "active"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "name": "Weekend Hiking Trip",
  "host": {
    "id": "uuid",
    "fullName": "John Doe",
    "avatarUrl": "..."
  },
  "category": {
    "id": "uuid",
    "name": "Outdoor Activity"
  },
  ...
}
```

### Get All Events

```http
GET /events?status=active&categoryId=uuid&search=hiking
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `status` (optional): Filter by status (draft, active, cancelled, completed)
- `categoryId` (optional): Filter by category
- `search` (optional): Search in name, description, location

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Weekend Hiking Trip",
    "host": { ... },
    "category": { ... },
    "_count": {
      "attendees": 10,
      "invitations": 25
    },
    ...
  }
]
```

### Get Event by ID

```http
GET /events/:id
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "id": "uuid",
  "name": "Weekend Hiking Trip",
  "description": "...",
  "host": { ... },
  "category": { ... },
  "attendees": [
    {
      "user": {
        "id": "uuid",
        "fullName": "Jane Smith",
        "avatarUrl": "..."
      },
      "joinedAt": "2024-12-01T10:00:00Z"
    }
  ],
  "invitations": [
    {
      "id": "uuid",
      "status": "pending"
    }
  ],
  "_count": {
    "attendees": 10,
    "invitations": 25
  }
}
```

### Update Event

```http
PATCH /events/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "cancelled",
  "cancellationReason": "Bad weather forecast"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "status": "cancelled",
  "cancellationReason": "Bad weather forecast",
  ...
}
```

### Delete Event

```http
DELETE /events/:id
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "message": "Event deleted successfully"
}
```

### Join Event

```http
POST /events/:id/join
Authorization: Bearer YOUR_TOKEN
```

**Response (201)**:
```json
{
  "id": "uuid",
  "eventId": "event-uuid",
  "userId": "user-uuid",
  "joinedAt": "2024-12-09T10:00:00Z",
  "event": { ... },
  "user": { ... }
}
```

### Leave Event

```http
DELETE /events/:id/leave
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "message": "Successfully left the event"
}
```

### Get Event Attendees

```http
GET /events/:id/attendees
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "joinedAt": "2024-12-01T10:00:00Z",
    "user": {
      "id": "uuid",
      "fullName": "Jane Smith",
      "avatarUrl": "...",
      "collegeName": "Stanford University",
      "major": "Biology"
    }
  }
]
```

---

## Invitations

### Send Single Invitation

```http
POST /invitations
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "eventId": "event-uuid",
  "inviteeId": "user-uuid",
  "personalMessage": "Hey! Would love for you to join us!"
}
```

**Response (201)**:
```json
{
  "id": "uuid",
  "eventId": "event-uuid",
  "inviteeId": "user-uuid",
  "inviterId": "inviter-uuid",
  "status": "pending",
  "personalMessage": "Hey! Would love for you to join us!",
  "event": { ... },
  "inviter": { ... },
  "invitee": { ... }
}
```

### Send Bulk Invitations

```http
POST /invitations/bulk
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "eventId": "event-uuid",
  "inviteeIds": ["user-uuid-1", "user-uuid-2", "user-uuid-3"],
  "personalMessage": "You're all invited to my event!"
}
```

**Response (201)**:
```json
{
  "message": "Successfully sent 3 invitations",
  "invitations": [ ... ],
  "skipped": 0
}
```

### Get My Invitations

```http
GET /invitations/my?status=pending
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `status` (optional): Filter by status (pending, going, declined)

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "personalMessage": "...",
    "event": {
      "id": "uuid",
      "name": "Weekend Hiking Trip",
      "host": { ... },
      "category": { ... },
      "_count": { "attendees": 10 }
    },
    "inviter": {
      "id": "uuid",
      "fullName": "John Doe",
      "avatarUrl": "..."
    }
  }
]
```

### Get Event Invitations (Host Only)

```http
GET /invitations/event/:eventId
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "status": "pending",
    "invitee": {
      "id": "uuid",
      "fullName": "Jane Smith",
      "collegeName": "Stanford University",
      "major": "Biology"
    },
    "createdAt": "2024-12-01T10:00:00Z"
  }
]
```

### Update Invitation Status

```http
PATCH /invitations/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "status": "going"
}
```

**Response (200)**:
```json
{
  "id": "uuid",
  "status": "going",
  "event": { ... }
}
```

### Delete Invitation

```http
DELETE /invitations/:id
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
{
  "message": "Invitation deleted successfully"
}
```

---

## Categories & Reference Data

### Get Event Categories

```http
GET /categories/events
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Study Session",
    "icon": "book",
    "createdAt": "2024-12-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Party",
    "icon": "music",
    "createdAt": "2024-12-01T00:00:00Z"
  }
]
```

### Get Interest Categories

```http
GET /categories/interests
Authorization: Bearer YOUR_TOKEN
```

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Sports & Fitness",
    "createdAt": "2024-12-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Arts & Music",
    "createdAt": "2024-12-01T00:00:00Z"
  }
]
```

### Get Colleges

```http
GET /categories/colleges?search=stanford
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters**:
- `search` (optional): Search by college name or location

**Response (200)**:
```json
[
  {
    "id": "uuid",
    "name": "Stanford University",
    "domain": "stanford.edu",
    "location": "Stanford, CA",
    "createdAt": "2024-12-01T00:00:00Z"
  }
]
```

---

## Error Responses

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error message here",
  "timestamp": "2024-12-09T10:00:00.000Z"
}
```

### Common Error Codes

- `400` Bad Request - Invalid input data
- `401` Unauthorized - Missing or invalid token
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource doesn't exist
- `409` Conflict - Resource already exists
- `500` Internal Server Error - Server error

---

## Rate Limiting

API requests are limited to **100 requests per minute** per IP address.

When rate limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Best Practices

1. **Always include Authorization header** for protected routes
2. **Validate input** before sending requests
3. **Handle errors gracefully** in your client
4. **Use query parameters** for filtering and searching
5. **Cache reference data** (categories, colleges) on client
6. **Implement retry logic** for failed requests
7. **Use pagination** when available (coming soon)

---

For interactive documentation and testing, visit: **http://localhost:3000/api/docs**
