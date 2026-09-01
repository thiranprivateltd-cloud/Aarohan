# API Contract & Schema Specifications - AMLP v2

## 1. Authentication Endpoints

### `POST /api/auth/signup`
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "student", // "student", "educator", "admin"
  "language": "en", // "en", "ta", "hi"
  "learningStyle": "visual",
  "accessibilityPrefs": {},
  "pace": "medium"
}
```
**Response (201 Created):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c81234567890",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "language": "en",
    "learningStyle": "visual",
    "accessibilityPrefs": {},
    "pace": "medium"
  }
}
```

### `POST /api/auth/login`
**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```
**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c81234567890",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "language": "en"
  }
}
```

---

## 2. ML Recommendation Endpoint

### Backend Endpoint: `POST /api/recommendation/recommend` (Requires Auth Bearer Token)
### ML Service Endpoint: `POST /recommend`
**Request Body:**
```json
{
  "quizScore": 35,
  "previousScores": [50, 45],
  "attemptCount": 1,
  "avgTimePerQuestion": 25.5,
  "engagementScore": 0.35 // optional (0.0 to 1.0, default null)
}
```
**Response (200 OK):**
```json
{
  "level": "easy", // "easy", "medium", "hard"
  "difficulty": 1, // 1 for easy, 2 for medium, 3 for hard
  "confidence": 0.95,
  "engagementNote": "reduced due to low engagement signals" // optional string
}
```

---

## 3. Database Schemas (Mongoose / Backend)

### User
- `name` (String, required)
- `email` (String, required, unique)
- `passwordHash` (String, required)
- `role` (Enum: `['student', 'educator', 'admin']`, default: `'student'`)
- `language` (Enum: `['en', 'ta', 'hi']`, default: `'en'`)
- `learningStyle` (String)
- `accessibilityPrefs` (Object)
- `pace` (String)
- `timestamps` (Boolean)

### Course
- `title` (String, required)
- `category` (String)
- `description` (String)
- `order` (Number)

### Lesson
- `courseId` (ObjectId ref: Course, required)
- `title` (String, required)
- `order` (Number)
- `content`:
  - `easy`: { `text`: String, `examples`: [String], `keyPoints`: [String], `translations`: { `en`: Object, `ta`: Object, `hi`: Object } }
  - `medium`: { `text`: String, `examples`: [String], `keyPoints`: [String], `translations`: { `en`: Object, `ta`: Object, `hi`: Object } }
  - `hard`: { `text`: String, `examples`: [String], `keyPoints`: [String], `translations`: { `en`: Object, `ta`: Object, `hi`: Object } }
- `quiz`: Array of `{ text: String, options: [String], correctIndex: Number }`

### Assessment
- `userId` (ObjectId ref: User, required)
- `quizId` / `courseId` (ObjectId)
- `type` (Enum: `['baseline', 'placement']`, required)
- `score` (Number, required)
- `answers` (Array)
- `timestamp` (Date, default: Date.now)

### Performance
- `userId` (ObjectId ref: User, required)
- `courseId` (ObjectId ref: Course, required)
- `topicScores` (Map of String -> Number)
- `currentLevel` (Enum: `['easy', 'medium', 'hard']`)
- `currentDifficulty` (Number)
- `history`: Array of `{ date: Date, score: Number, level: String, engagementScore: Number }`

### EngagementLog
- `userId` (ObjectId ref: User, required)
- `lessonId` (ObjectId ref: Lesson, required)
- `sessionStart` (Date, default: Date.now)
- `tabSwitchCount` (Number, default: 0)
- `idleSeconds` (Number, default: 0)
- `avgTimePerSection` (Number, default: 0)
- `expressionSamples`: Array of `{ timestamp: Date, expression: String, confidence: Number }` (Populated in Block 3, schema defined now)
