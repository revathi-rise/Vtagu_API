# Vtagu API - Module Quick Reference

## 🎬 CONTENT MODULES

### Movies Module
```
Location: src/movies/
Files:
  - movies.module.ts (Router)
  - movies.controller.ts (HTTP: GET /movies, POST, PUT, DELETE)
  - movies.service.ts (CRUD operations)
  - movie.entity.ts (DB: movie table)
  - movies.dto.ts (Data validation)

Key Endpoints:
  GET    /api/movies              → All movies
  GET    /api/movies/trending?limit=10 → Top N movies
  GET    /api/movies/:slug        → Movie by slug
  POST   /api/movies              → Create movie
  PUT    /api/movies/:id          → Update movie
  DELETE /api/movies/:id          → Delete movie

Key Entity Fields:
  - movie_id (PK)
  - title, slug, description_short, description_long
  - year, rating, genre_id, director, actors
  - movie_image, trailer_url, featured, free
```

### Posters Module
```
Location: src/posters/
Files:
  - posters.module.ts
  - posters.controller.ts (HTTP handlers)
  - posters.service.ts (CRUD)
  - poster.entity.ts (DB)

Purpose: Manage movie poster/image assets
Methods: Standard CRUD (GET all/one, POST, PUT, DELETE)
```

### Genres Module
```
Location: src/genres/
Purpose: Movie genre categorization
Methods: List genres, associate with movies via genre_id FK
```

### Content Module
```
Location: src/content/
Purpose: Generic content management (reusable for various content types)
Methods: CRUD operations
```

### Episodes Module
```
Location: src/episodes/
Purpose: Series/season episodes
Methods: List episodes, create episodes
```

### Scenes Module
```
Location: src/scenes/
Purpose: Individual scenes within movies
Methods: CRUD for scenes
Related: Links to Movie via implied relationship
```

### Choices Module
```
Location: src/choices/
Purpose: Interactive movie choices (decision points)
DTO: src/choices/dto/choice.dto.ts
Methods: Create/retrieve choices for interactive movies
```

### Interactive Movies Module
```
Location: src/interactive-movies/
Purpose: Orchestrates interactive movie experience
Manages: Movies + Scenes + Choices together
Methods: Complex queries combining multiple entities
```

---

## 👥 USER MANAGEMENT MODULES

### Users Module
```
Location: src/users/
Files:
  - users.module.ts
  - users.controller.ts
  - users.service.ts
  - entities/user.entity.ts
  - dto/user.dto.ts

Key Endpoints:
  GET    /api/users              → All users
  GET    /api/users/:id          → User by ID
  POST   /api/users              → Create/Register user
  PUT    /api/users/:id          → Update user
  DELETE /api/users/:id          → Delete user

Key Entity Fields:
  - user_id (PK)
  - email (unique), user_name, password
  - mobile, otp, otp_verified
  - age, dob, gender, type (email|phone|oauth)
  - profile_picture
  - Payment info: card_name, card_number, card_expiry, card_ccv, upi
  - register_step (user onboarding progress)
  - login_oauth_uid (for OAuth integration)
```

### Subscriptions Module
```
Location: src/subscriptions/
Files:
  - subscriptions.module.ts
  - subscriptions.controller.ts
  - subscriptions.service.ts
  - entities/subscription.entity.ts
  - dto/subscription.dto.ts

Key Endpoints:
  GET    /api/subscriptions              → All subscriptions
  GET    /api/subscriptions/:id          → Subscription by ID
  POST   /api/subscriptions              → Create subscription
  PUT    /api/subscriptions/:id          → Update subscription
  DELETE /api/subscriptions/:id          → Cancel subscription

Key Entity Fields:
  - subscription_id (PK)
  - user_id (FK → User)
  - plan_id (reference to plan)
  - txn_id, payment_method (credit_card|upi|wallet)
  - price_amount, paid_amount
  - timestamp_from, timestamp_to (billing period)
  - payment_status (pending|success|failed)
  - status (active|inactive|expired|cancelled)
  - currency (default: INR)

Relationships:
  - ManyToOne: User (user_id FK)
  - JoinColumn: @JoinColumn({ name: 'user_id' })
```

### User Devices Module
```
Location: src/user-devices/
Files:
  - user-devices.module.ts
  - user-devices.controller.ts
  - user-devices.service.ts
  - entities/user-device.entity.ts
  - dto/user-device.dto.ts

Purpose: Track user devices (multi-device support)
Methods: CRUD for device registration/deregistration
Key Fields:
  - user_id (FK → User)
  - device_id, device_name, device_type
```

---

## 🔌 MODULE INTEGRATION POINTS

### 1. Root Module (app.module.ts)
Imports all 11 modules + TypeORM config

### 2. Module Dependencies
```
User
  ↓ (user_id FK)
Subscription ← Must exist after User creation
  
User
  ↓ (user_id FK)
UserDevice ← Must exist after User creation

Movie
  ↓ (genre_id FK)
Genre ← Should exist before Movie creation

Movie
  ↓ (relationships)
Scene, Choice ← Associated with Movies

InteractiveMovie
  ↓ (orchestrates)
Movie, Scene, Choice ← Combines multiple entities
```

### 3. Cross-Module Queries
- **Movies Service** can query Genres when fetching movies
- **Subscriptions Service** fetches User data for subscription context
- **Interactive Movies Service** combines Movie + Scene + Choice data

---

## 📦 DTO STRUCTURE PATTERN

### Create DTO Example (Users)
```typescript
export class CreateUserDto {
  email: string;           // Required
  user_name: string;       // Required
  password: string;        // Required
  mobile?: string;         // Optional
  age?: number;            // Optional
  dob?: string;            // Optional
  gender?: string;         // Optional
}
```

### Response DTO Example
```typescript
export class UserResponseDto {
  id: number;              // Mapped from user_id
  email: string;
  userName: string;        // Mapped from user_name
  // Sensitive fields excluded: password, card_number, card_ccv
}
```

---

## 🎯 COMMON OPERATIONS

### Adding New Endpoint
1. Add method to `[feature].service.ts`
2. Add `@Get/@Post/@Put/@Delete` to `[feature].controller.ts`
3. Wrap with try-catch for response format
4. Test with curl or Postman

### Adding New Database Field
1. Add `@Column()` to entity
2. Create TypeORM migration (if using migrations)
3. Run migration
4. Update DTO if field is input/output
5. Update service mapping logic

### Adding Module-to-Module Relationship
1. Use `@ManyToOne/@OneToMany/@ManyToMany` decorators
2. Use `@JoinColumn` for FK side
3. Update services to handle joins
4. Test queries with relations

---

## 🔍 DEBUGGING CHECKLIST

- [ ] Module imported in app.module.ts?
- [ ] TypeOrmModule.forFeature([Entity]) in feature module?
- [ ] Service injected in controller constructor?
- [ ] Entity imported in app.module.ts TypeOrmModule.forRoot()?
- [ ] Database table exists?
- [ ] Foreign key constraints valid?
- [ ] Response format: {status, message, data}?
- [ ] Error handling try-catch present?

---

## 🚦 EXECUTION ORDER

When server starts:
```
1. main.ts executes
2. NestFactory.create(AppModule)
3. AppModule imports TypeOrmModule.forRoot() → connects to MySQL
4. AppModule imports all 11 feature modules
5. Each feature module registers its controller & service
6. Controllers register routes at /api/[module-name]
7. CORS enabled for localhost:3001
8. Server listens on port 3000
```

---

## 📊 Database Tables Overview

| Table | Module | Purpose |
|-------|--------|---------|
| movie | Movies | Main movie content |
| poster | Posters | Movie images/posters |
| genre | Genres | Movie genres |
| content | Content | Generic content |
| episode | Episodes | Series episodes |
| scene | Scenes | Movie scenes |
| choice | Choices | Interactive choices |
| interactive_movie | InteractiveMovies | Interactive movie orchestration |
| user | Users | User accounts |
| subscription | Subscriptions | User subscription plans |
| user_device | UserDevices | User device tracking |

---

## 🛠️ TOOLS & EXTENSIONS RECOMMENDED

1. **Postman** - API testing
2. **MySQL Workbench** - Database visualization
3. **VS Code Extensions**:
   - REST Client
   - Thunder Client
   - Prettier (formatting)
   - ESLint (linting)
4. **TypeORM CLI** - Database migrations

---

## 📋 TASK TRACKING

Use this when implementing changes:

```
- [ ] Identify affected modules
- [ ] Backup current database
- [ ] Create migrations (if schema changes)
- [ ] Update entity files
- [ ] Update DTOs
- [ ] Update service logic
- [ ] Update controller routes
- [ ] Update app.module.ts if new module
- [ ] Test all endpoints
- [ ] Test cross-module queries
- [ ] Update this documentation
```
