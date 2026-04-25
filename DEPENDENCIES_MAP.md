# Vtagu API - Module Dependencies & Relationships

## 📊 DEPENDENCY GRAPH

```
AppModule (Root)
├── TypeOrmModule (MySQL Connection)
│   └── All 11 entities registered
│
├── MoviesModule
│   └── Movie entity
│
├── PostersModule
│   └── Poster entity
│
├── GenresModule
│   └── Genre entity
│       ↑ Referenced by Movie (genre_id)
│
├── ContentModule
│   └── Content entity
│
├── EpisodesModule
│   └── Episode entity
│
├── ScenesModule
│   └── Scene entity
│       ↑ Related to Movie (implied FK)
│
├── ChoicesModule
│   └── Choice entity
│       ↑ Related to Movie (implied FK)
│
├── InteractiveMoviesModule (ORCHESTRATOR)
│   └── InteractiveMovie entity
│       ↓ Combines:
│       ├── Movie
│       ├── Scene
│       └── Choice
│
├── UsersModule
│   └── User entity
│       ↑ Referenced by:
│       ├── Subscription (user_id FK)
│       └── UserDevice (user_id FK)
│
├── SubscriptionsModule
│   └── Subscription entity
│       ↓ Relationships:
│       └── ManyToOne → User (user_id)
│
└── UserDevicesModule
    └── UserDevice entity
        ↓ Relationships
        └── User (user_id FK)
```

---

## 🔗 ENTITY RELATIONSHIPS DETAIL

### 1. User → Subscription (One-to-Many)
```typescript
// In User entity (implicit)
// One user can have many subscriptions

// In Subscription entity (explicit)
@ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;
```

### 2. User → UserDevice (One-to-Many)
```typescript
// One user can have many devices
// Implementation likely similar to Subscription
```

### 3. Genre ← Movie (Many-to-One implied)
```typescript
// In Movie entity
genre_id: number; // FK to Genre

// Can be made explicit with:
@ManyToOne(() => Genre)
@JoinColumn({ name: 'genre_id' })
genre: Genre;
```

### 4. Movie ← Scene (One-to-Many implied)
```typescript
// Scenes belong to Movies
// Likely uses implied FK in Scene entity
```

### 5. Movie ← Choice (One-to-Many implied)
```typescript
// Choices are associated with Movies
// For interactive movie decision points
```

### 6. InteractiveMovie (Composite/Junction)
```typescript
// Likely references:
// - movie_id (FK to Movie)
// - Contains multiple scenes_id
// - Contains multiple choice_id
// Creates interactive movie experience
```

---

## 🎯 REQUEST FLOW BY MODULE

### Content Retrieval Flow
```
Client GET /api/movies/:slug
    ↓
MoviesController.findOne(slug)
    ↓
MoviesService.findOneBySlug(slug)
    ↓
TypeOrmRepository.findOne({ where: { slug } })
    ↓
MySQL: SELECT * FROM movie WHERE slug = ?
    ↓
Return Movie entity
    ↓
Service: mapToResponse(movie) → MovieResponseDto
    ↓
Controller: Wrap {status, message, data}
    ↓
Client receives: {status: true, message: "...", data: {...}}
```

### Subscription Creation Flow (Cross-module)
```
Client POST /api/subscriptions
    ↓
SubscriptionsController.create(CreateSubDto)
    ↓
SubscriptionsService.create(dto)
    ↓
TypeOrmRepository.create(mapped_data)
    ↓
MySQL: INSERT INTO subscription (user_id, plan_id, ...)
    ↓
UsersModule: Can fetch User data if needed (user_id FK)
    ↓
Return Subscription entity with User relation
    ↓
Service: mapToResponse() → SubscriptionResponseDto
    ↓
Controller: Wrap response
    ↓
Client receives subscription confirmation
```

### Interactive Movie Flow (Multi-module)
```
Client GET /api/interactive-movies/:id
    ↓
InteractiveMoviesController.findOne(id)
    ↓
InteractiveMoviesService.findOne(id)
    ↓
MySQL: SELECT * FROM interactive_movie WHERE id = ?
    ↓
Fetch related:
    ├── Movie (via movie_id FK)
    ├── Scenes (via scene_ids)
    └── Choices (via choice_ids)
    ↓
Service: Aggregate data from all modules
    ↓
Return: {movie, scenes, choices, interactive_metadata}
    ↓
Controller: Wrap response
    ↓
Client receives complete interactive experience data
```

---

## 🚨 CRITICAL DEPENDENCIES

### Database Must Exist
```
MySQL running
├── Tables created for all 11 entities
├── Foreign key constraints configured
└── Indexes on frequently queried columns
```

### Environment Configuration
```
.env file required:
├── DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
├── PORT (server port)
└── CORS_ORIGIN (frontend URL)
```

### Module Import Order
```
app.module.ts MUST have:
1. TypeOrmModule.forRoot() BEFORE any feature modules
2. ALL 11 feature modules imported
3. Each module registers TypeOrmModule.forFeature([Entity])
```

---

## 🔄 CIRCULAR DEPENDENCY CHECK

✅ **NO circular dependencies detected:**
- InteractiveMovie depends on Movie/Scene/Choice ✓
- Subscription depends on User ✓
- UserDevice depends on User ✓
- All feature modules depend only on TypeORM ✓
- AppModule depends on all feature modules ✓

---

## 📈 SCALABILITY CONSIDERATIONS

### Current Limitations
- No caching layer (all queries hit DB)
- No pagination in Movie.findAll() (can be large)
- No query optimization (N+1 problem potential)
- No database indexes specified

### Recommended Improvements
1. **Add Redis** for caching frequently accessed entities
2. **Implement Pagination** on list endpoints (skip/take)
3. **Optimize Queries** with eager loading of relations
4. **Add Indexes** on FK columns and slug fields
5. **Separate Services** if modules become too large

### Suggested New Modules (Future)
```
- CacheModule (Redis integration)
- PaymentModule (external payment provider)
- NotificationModule (email/SMS alerts)
- AnalyticsModule (user behavior tracking)
- RecommendationModule (content recommendations)
```

---

## 🔐 SECURITY CONSIDERATIONS

### Current State
- ❌ No authentication implemented (auth folder empty)
- ❌ No input validation
- ❌ Password stored as plain text in User entity (critical)
- ❌ No rate limiting
- ❌ CORS allows all credentials

### High Priority Fixes
1. **Add JWT Authentication** → AuthModule
2. **Hash Passwords** → Use bcrypt in UsersService
3. **Add Request Validation** → class-validator DTOs
4. **Add Rate Limiting** → throttler module
5. **Fix CORS** → Whitelist specific origins

### Recommended New Module
```
src/auth/
├── auth.module.ts
├── auth.service.ts (JWT, password hash)
├── auth.controller.ts (login, register)
├── guards/jwt.guard.ts (route protection)
└── decorators/current-user.decorator.ts
```

---

## 📋 MODULE CHECKLIST

### Each Module Must Have
- [ ] [name].module.ts
- [ ] [name].controller.ts
- [ ] [name].service.ts
- [ ] entities/[entity].entity.ts
- [ ] Registered in app.module.ts TypeOrmModule.forRoot()
- [ ] Routes prefixed with module name

### Each Controller Must Have
- [ ] Consistent response format {status, message, data}
- [ ] Try-catch error handling
- [ ] Proper HTTP method decorators (@Get, @Post, etc.)
- [ ] Route parameters validation

### Each Service Must Have
- [ ] Repository injected via @InjectRepository
- [ ] Business logic isolated from controllers
- [ ] Error handling with meaningful messages
- [ ] DTO mapping methods

### Each Entity Must Have
- [ ] @Entity() decorator with table name
- [ ] Primary key with @PrimaryGeneratedColumn()
- [ ] Columns with @Column() decorators
- [ ] Relationships with @ManyToOne/@OneToMany/etc
- [ ] JoinColumn decorators for FK side

---

## 🎓 LEARNING PATH

If you're new to this codebase:

1. **Start Here**: README.md (quick start)
2. **Then**: app.module.ts (root configuration)
3. **Then**: main.ts (bootstrap)
4. **Then**: One complete module (e.g., Movies)
   - movies.module.ts
   - movies.controller.ts
   - movies.service.ts
   - movie.entity.ts
5. **Then**: Database schema (examine MySQL tables)
6. **Then**: ProjectManagement.md (full architecture)
7. **Finally**: Implement new features

---

## 🚀 QUICK START FOR DEVELOPMENT

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=vtagu
PORT=3000
CORS_ORIGIN=http://localhost:3001

# 3. Create database in MySQL
CREATE DATABASE vtagu;

# 4. Run migrations or let TypeORM sync
npm run start:dev

# 5. Test endpoint
curl http://localhost:3000/api/movies

# 6. Make changes
# - Edit src/[module]/
# - Server auto-reloads
# - Check console for errors
```

---

## 📞 TROUBLESHOOTING

### Module Not Working
1. Check if imported in app.module.ts
2. Check if TypeOrmModule.forFeature([Entity]) in module
3. Check if entity is in app.module.ts TypeOrmModule.forRoot()
4. Check if controller has @Controller() decorator
5. Check if service injected in controller

### Database Connection Issues
1. Verify MySQL is running
2. Check .env credentials
3. Check if database exists
4. Check TypeORM synchronize setting
5. Check foreign key constraints

### Route Not Found
1. Check @Controller() prefix in controller
2. Check HTTP method decorator (@Get, @Post)
3. Check URL path matches
4. Check server is running on correct port
5. Check CORS configuration

---

## 📊 ENTITY FIELD MAPPING REFERENCE

| Entity | Module | PK | Key FKs | Purpose |
|--------|--------|-----|---------|---------|
| Movie | Movies | movie_id | genre_id | Core content |
| Poster | Posters | poster_id | - | Assets |
| Genre | Genres | genre_id | - | Categories |
| Content | Content | content_id | - | Generic content |
| Episode | Episodes | episode_id | - | Series content |
| Scene | Scenes | scene_id | movie_id* | Movie segments |
| Choice | Choices | choice_id | movie_id* | Interactions |
| InteractiveMovie | InteractiveMovies | id | - | Orchestrator |
| User | Users | user_id | - | Accounts |
| Subscription | Subscriptions | subscription_id | user_id | Plans |
| UserDevice | UserDevices | device_id | user_id | Multi-device |

*Implied relationships (likely FK, not yet explicit)
