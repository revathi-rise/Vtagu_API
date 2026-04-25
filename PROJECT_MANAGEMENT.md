# Vtagu API - Project Management & Development Guide

## 📋 PROJECT OVERVIEW

**Vtagu API** is a NestJS-based Backend API for a streaming platform managing interactive movies with user subscriptions.

### Core Purpose
- Stream movies, episodes, and interactive content
- Manage user subscriptions and payments
- Track user interactions with interactive movies (choices/scenes)
- Support multi-device user sessions

---

## 🏗️ PROJECT STRUCTURE & LAYERS

### Layer 1: Entry Point
```
main.ts
├── Bootstrap NestJS App
├── Enable CORS (localhost:3001)
├── Set Global Route Prefix (/api)
└── Listen on Port (default: 3000)
```

### Layer 2: Root Configuration
```
app.module.ts
├── Configure TypeORM MySQL Connection
└── Import 11 Feature Modules
```

### Layer 3: Feature Modules (11 Total)
Each follows the same structure:
```
[feature].module.ts (Orchestrator)
├── [feature].controller.ts (HTTP Handlers - GET, POST, PUT, DELETE)
├── [feature].service.ts (Business Logic)
├── entities/[entity].entity.ts (TypeORM Model)
└── dto/[feature].dto.ts (Data Transfer Objects - optional)
```

### Layer 4: Database
```
MySQL Database
├── 11 Main Tables (Movie, Poster, Genre, Content, Episode, Scene, Choice, InteractiveMovie, User, Subscription, UserDevice)
├── Relationships (FK constraints, JoinColumns)
└── TypeORM ORM (Automatic SQL generation)
```

---

## 📊 MODULES & RESPONSIBILITIES

### Content Management (8 modules)
1. **Movies** - Movie CRUD & querying
2. **Posters** - Movie assets/images
3. **Genres** - Movie categorization
4. **Content** - Generic content management
5. **Episodes** - Series episodes
6. **Scenes** - Movie scenes
7. **Choices** - Interactive choices
8. **InteractiveMovies** - Orchestrates Movies + Scenes + Choices

### User Management (3 modules)
1. **Users** - User authentication, profile, payment info
2. **Subscriptions** - Payment plans, billing cycles, status tracking
3. **UserDevices** - Device tracking per user

---

## 🔄 DATA FLOW EXAMPLES

### Example 1: Fetch Movie List
```
GET /api/movies
  → MoviesController.findAll()
    → MoviesService.findAll()
      → TypeOrmRepository.find()
        → SELECT * FROM movie ORDER BY movie_id DESC
      ← Returns Movie[]
    ← Maps to MovieResponseDto[]
  ← Returns {status: true, message: "...", data: [...]}
```

### Example 2: Create Subscription
```
POST /api/subscriptions
  → SubscriptionsController.create(CreateSubDto)
    → SubscriptionsService.create()
      → TypeOrmRepository.create() & save()
        → INSERT INTO subscription (...)
      ← Returns Subscription entity
    ← Maps to SubscriptionResponseDto
  ← Returns {status: true, message: "...", data: {...}}
```

---

## 🗄️ DATABASE RELATIONSHIPS

```
User (1-to-Many)
├── Subscription (user_id FK)
└── UserDevice (user_id FK)

Movie (1-to-Many)
├── Scene (implied foreign key)
├── Choice (implied foreign key)
└── Genre (genre_id FK)

InteractiveMovie (manages)
├── Movies
├── Scenes
└── Choices
```

---

## ⚙️ CURRENT CONFIGURATION

### Environment Variables Required
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=vtagu

# Server
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3001
```

### Scripts
```bash
npm run start:dev    # Development with hot-reload (ts-node-dev)
npm run build        # TypeScript compilation to dist/
npm start            # Run compiled JavaScript
npm test             # Not configured yet
```

---

## 🚀 PROJECT MANAGEMENT RECOMMENDATIONS

### ✅ STRENGTHS
- ✓ Clean modular architecture (NestJS best practices)
- ✓ Consistent API response format
- ✓ Type-safe with TypeScript
- ✓ Scalable module structure
- ✓ Good separation of concerns (Controller-Service-Repository)

### ⚠️ AREAS FOR IMPROVEMENT

#### 1. **Authentication & Authorization** (CRITICAL)
- **Status**: Auth folder is empty
- **Action**: Implement JWT authentication
- **Impact**: Required for user security
- **Effort**: High (5-10 hours)
```
Create: src/auth/
├── auth.module.ts
├── auth.service.ts (JWT tokens, password hashing)
├── auth.controller.ts (Login, Register, Refresh)
├── guards/jwt.guard.ts (Route protection)
└── decorators/user.decorator.ts (Extract user from token)
```

#### 2. **Input Validation** (HIGH PRIORITY)
- **Status**: No global validation pipes
- **Action**: Use class-validator & class-transformer
- **Impact**: Prevents malformed requests
- **Effort**: Medium (3-5 hours)
```
Install: npm install class-validator class-transformer
Add: GlobalValidationPipe in main.ts
Create: DTOs for all input endpoints
```

#### 3. **Error Handling** (MEDIUM PRIORITY)
- **Status**: Basic try-catch without typed exceptions
- **Action**: Create custom exception filters
- **Impact**: Better error messages for clients
- **Effort**: Medium (2-3 hours)
```
Create: src/common/filters/
├── http-exception.filter.ts
└── validation.filter.ts
```

#### 4. **Logging & Monitoring** (MEDIUM PRIORITY)
- **Status**: Only console.log in main.ts
- **Action**: Implement Winston or Pino logger
- **Impact**: Production debugging capabilities
- **Effort**: Medium (2-3 hours)

#### 5. **Testing** (LOW PRIORITY NOW)
- **Status**: No tests configured
- **Action**: Setup Jest for unit & integration tests
- **Impact**: Code reliability verification
- **Effort**: High (ongoing)

#### 6. **Database Migrations** (HIGH PRIORITY)
- **Status**: synchronize: false (correct), but no migration system
- **Action**: Implement TypeORM migrations
- **Impact**: Safe database schema changes
- **Effort**: Medium (2-3 hours)
```bash
npx typeorm migration:generate -n InitialSchema
npx typeorm migration:run
```

#### 7. **API Documentation** (MEDIUM PRIORITY)
- **Status**: No Swagger/OpenAPI docs
- **Action**: Install @nestjs/swagger
- **Impact**: Client-friendly API reference
- **Effort**: Medium (2-3 hours)

#### 8. **Rate Limiting** (MEDIUM PRIORITY)
- **Status**: No rate limiting
- **Action**: Implement @nestjs/throttler
- **Impact**: Protection against abuse
- **Effort**: Low (1-2 hours)

---

## 📈 DEVELOPMENT ROADMAP

### Phase 1: SECURITY (Week 1-2)
- [ ] Implement JWT Authentication
- [ ] Add Input Validation (class-validator)
- [ ] Setup Error Handling Filters
- [ ] Add Rate Limiting

### Phase 2: QUALITY (Week 3)
- [ ] Setup Database Migrations
- [ ] Add Winston Logger
- [ ] Create Unit Tests (core services)
- [ ] Setup CI/CD Pipeline

### Phase 3: DOCUMENTATION (Week 4)
- [ ] Add Swagger Documentation
- [ ] Document API endpoints
- [ ] Create deployment guide
- [ ] Create database schema docs

### Phase 4: OPTIMIZATION (Week 5+)
- [ ] Add caching (Redis)
- [ ] Optimize database queries
- [ ] Setup performance monitoring
- [ ] Add integration tests

---

## 🔧 KEY FILES TO MODIFY WHEN UPDATING

### Always Edit These When Adding Features
1. **src/app.module.ts** - Import new modules
2. **src/main.ts** - Add global middleware/pipes
3. **src/[feature]/[feature].module.ts** - Configure feature
4. **src/[feature]/[feature].controller.ts** - Define routes
5. **src/[feature]/[feature].service.ts** - Add business logic
6. **src/[feature]/entities/[entity].entity.ts** - Define database model

### Always Check These
- **package.json** - Dependency versions
- **.env** - Database configuration
- **tsconfig.json** - TypeScript settings

---

## 📝 CODING STANDARDS

### Response Format (Mandatory)
```typescript
{
  status: boolean,
  message: string,
  data: T | null
}
```

### Error Handling Pattern
```typescript
try {
  const data = await this.service.operation();
  return { status: true, message: 'Success', data };
} catch (error) {
  return { status: false, message: error.message, data: null };
}
```

### Entity Naming Convention
- Class: `PascalCase` (Movie, User, Subscription)
- Table: `snake_case` (@Entity('movie'))
- Column: `snake_case` (@Column({ name: 'user_id' }))
- TypeScript properties: `camelCase` (userId)

### DTO Naming
- Create DTO: `Create[Entity]Dto`
- Update DTO: `Update[Entity]Dto`
- Response DTO: `[Entity]ResponseDto`

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Setup Environment**
   ```bash
   npm install
   # Create .env file with DB credentials
   npm run start:dev
   ```

2. **Test Current State**
   ```bash
   curl http://localhost:3000/api/movies
   ```

3. **Plan Feature Updates**
   - List what needs to change in src/
   - Identify which modules need modifications
   - Plan new modules if adding features

4. **Document Changes**
   - Update this guide as you make changes
   - Track module dependencies
   - Note breaking changes

---

## 📚 USEFUL COMMANDS

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run build              # Build TypeScript

# Database
npx typeorm migration:generate -n MigrationName
npx typeorm migration:run
npx typeorm migration:revert

# Module Scaffolding (future)
nest generate service [name]
nest generate controller [name]
nest generate module [name]
```

---

## 🔗 RESOURCES

- NestJS Documentation: https://docs.nestjs.com
- TypeORM Documentation: https://typeorm.io
- MySQL Documentation: https://dev.mysql.com

---

## 📞 SUPPORT

For module-specific questions, refer to individual service/controller files.
