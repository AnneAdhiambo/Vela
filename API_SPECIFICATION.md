# Vela API Specification

This document outlines the API endpoints required for the Vela Chrome Extension authentication and data synchronization.

## Base URL
- **Production**: `https://api.vela-app.com`
- **Development**: `http://localhost:3001/api`

## Authentication Flow

### 1. Send Magic Link
**Endpoint**: `POST /auth/magic-link`

**Request Body**:
```json
{
  "email": "user@example.com",
  "redirectUrl": "chrome-extension://extension-id/index.html"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Magic link sent to your email"
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Invalid email address"
}
```

### 2. Verify Magic Link
**Endpoint**: `POST /auth/verify`

**Request Body**:
```json
{
  "token": "magic_link_token_from_email"
}
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "token": "jwt_auth_token",
  "createdAt": "2024-01-01T00:00:00Z",
  "preferences": {
    "theme": "system",
    "accentColor": "blue",
    "defaultSessionLength": 25,
    "defaultBreakLength": 5,
    "skipBreaks": false,
    "notificationsEnabled": true,
    "soundEnabled": true,
    "spotifyConnected": false,
    "motivationalQuotes": true
  }
}
```

### 3. Verify Auth Token
**Endpoint**: `POST /auth/verify-token`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Response**:
```json
{
  "valid": true
}
```

### 4. Logout
**Endpoint**: `POST /auth/logout`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Response**:
```json
{
  "success": true
}
```

## User Management

### 1. Get User Profile
**Endpoint**: `GET /user/profile`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Response**:
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastActiveAt": "2024-01-15T10:30:00Z",
  "preferences": {
    "theme": "system",
    "accentColor": "blue",
    "defaultSessionLength": 25,
    "defaultBreakLength": 5,
    "skipBreaks": false,
    "notificationsEnabled": true,
    "soundEnabled": true,
    "spotifyConnected": false,
    "motivationalQuotes": true
  }
}
```

### 2. Update User Preferences
**Endpoint**: `PUT /user/preferences`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Request Body**:
```json
{
  "preferences": {
    "theme": "dark",
    "accentColor": "purple",
    "defaultSessionLength": 30,
    "defaultBreakLength": 10,
    "skipBreaks": true,
    "notificationsEnabled": true,
    "soundEnabled": false,
    "spotifyConnected": true,
    "motivationalQuotes": true
  }
}
```

**Response**:
```json
{
  "success": true
}
```

## Data Synchronization

### 1. Sync User Data
**Endpoint**: `POST /user/sync`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Request Body**:
```json
{
  "tasks": [
    {
      "id": "task_123",
      "text": "Complete project",
      "completed": false,
      "createdAt": "2024-01-15T09:00:00Z",
      "order": 0
    }
  ],
  "stats": [
    {
      "date": "2024-01-15",
      "sessionsStarted": 5,
      "sessionsCompleted": 4,
      "totalFocusTime": 100,
      "tasksCreated": 3,
      "tasksCompleted": 2,
      "streak": 5
    }
  ],
  "sessions": [
    {
      "id": "session_123",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T09:25:00Z",
      "plannedDuration": 25,
      "actualDuration": 25,
      "sessionType": "work",
      "completed": true,
      "pausedTime": 0,
      "tasksWorkedOn": ["task_123"]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "syncedAt": "2024-01-15T10:30:00Z"
}
```

### 2. Get User Data
**Endpoint**: `GET /user/data`

**Headers**:
```
Authorization: Bearer jwt_auth_token
```

**Query Parameters**:
- `since` (optional): ISO date string to get data since a specific date
- `limit` (optional): Number of records to return (default: 100)

**Response**:
```json
{
  "tasks": [
    {
      "id": "task_123",
      "text": "Complete project",
      "completed": false,
      "createdAt": "2024-01-15T09:00:00Z",
      "completedAt": null,
      "order": 0
    }
  ],
  "stats": [
    {
      "date": "2024-01-15",
      "sessionsStarted": 5,
      "sessionsCompleted": 4,
      "totalFocusTime": 100,
      "tasksCreated": 3,
      "tasksCompleted": 2,
      "streak": 5
    }
  ],
  "sessions": [
    {
      "id": "session_123",
      "userId": "user_123",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T09:25:00Z",
      "plannedDuration": 25,
      "actualDuration": 25,
      "sessionType": "work",
      "completed": true,
      "pausedTime": 0,
      "tasksWorkedOn": ["task_123"]
    }
  ],
  "lastSyncAt": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limits

- **Magic Link**: 5 requests per hour per email
- **Auth Verification**: 10 requests per minute per IP
- **Data Sync**: 60 requests per hour per user
- **General API**: 1000 requests per hour per user

## Security

### Authentication
- All authenticated endpoints require a valid JWT token in the Authorization header
- Tokens expire after 30 days of inactivity
- Magic link tokens expire after 15 minutes

### Data Protection
- All data is encrypted in transit (HTTPS)
- User data is encrypted at rest
- No sensitive data is logged
- GDPR compliant data handling

### CORS
- Only chrome-extension:// origins are allowed
- Specific extension IDs must be whitelisted

## Implementation Notes

### Magic Link Email Template
The magic link email should include:
- Clear branding (Vela logo)
- Explanation of what the link does
- Security notice about not sharing the link
- Link expiration time (15 minutes)
- Support contact information

### Token Management
- JWT tokens should include user ID and permissions
- Refresh tokens should be implemented for long-term sessions
- Token blacklisting for logout functionality

### Data Sync Strategy
- Implement conflict resolution for concurrent edits
- Use timestamps for last-modified tracking
- Support incremental sync to reduce bandwidth
- Implement offline queue for failed sync attempts

### Monitoring
- Log all authentication attempts
- Monitor for suspicious activity patterns
- Track API usage and performance metrics
- Alert on error rate spikes

## Example Implementation (Node.js/Express)

```javascript
// Magic link endpoint
app.post('/auth/magic-link', async (req, res) => {
  const { email, redirectUrl } = req.body
  
  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email address'
    })
  }
  
  // Generate magic link token
  const token = generateMagicLinkToken(email)
  
  // Send email
  await sendMagicLinkEmail(email, token, redirectUrl)
  
  res.json({
    success: true,
    message: 'Magic link sent to your email'
  })
})

// Verify magic link
app.post('/auth/verify', async (req, res) => {
  const { token } = req.body
  
  try {
    const email = verifyMagicLinkToken(token)
    let user = await getUserByEmail(email)
    
    if (!user) {
      user = await createUser(email)
    }
    
    const authToken = generateAuthToken(user.id)
    
    res.json({
      ...user,
      token: authToken
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid or expired magic link'
    })
  }
})
```

This API specification provides a complete foundation for implementing the Vela authentication and data synchronization backend.