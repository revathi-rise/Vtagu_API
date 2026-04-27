"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
const typeorm_1 = require("typeorm");
let Movie = class Movie {
};
exports.Movie = Movie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Movie.prototype, "movie_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description_short', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "description_short", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description_long', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "description_long", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Movie.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country_id', nullable: true }),
    __metadata("design:type", Number)
], Movie.prototype, "country_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], Movie.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genre_id', nullable: true }),
    __metadata("design:type", Number)
], Movie.prototype, "genre_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'age_group', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "age_group", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "actors", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "director", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Movie.prototype, "featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Movie.prototype, "free", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'movie_type', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "movie_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'age_restriction', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "age_restriction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kids_restriction', default: false }),
    __metadata("design:type", Boolean)
], Movie.prototype, "kids_restriction", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trailer_url', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "trailer_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trailer_alt', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "trailer_alt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'movie_image', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "movie_image", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'poster_alt', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "poster_alt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "languages", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'view_count', default: 0 }),
    __metadata("design:type", Number)
], Movie.prototype, "view_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_interactive', default: false }),
    __metadata("design:type", Boolean)
], Movie.prototype, "is_interactive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'interactive_map', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Movie.prototype, "interactive_map", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Movie.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Movie.prototype, "updated_at", void 0);
exports.Movie = Movie = __decorate([
    (0, typeorm_1.Entity)('movie')
], Movie);
//# sourceMappingURL=movie.entity.js.map