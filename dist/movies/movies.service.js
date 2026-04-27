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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const movie_entity_1 = require("./movie.entity");
let MoviesService = class MoviesService {
    constructor(moviesRepo) {
        this.moviesRepo = moviesRepo;
    }
    async findAll() {
        const movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' } });
        return movies.map(m => this.mapToResponse(m));
    }
    async findForHome(limit = 10) {
        const movies = await this.moviesRepo.find({ order: { movie_id: 'DESC' }, take: limit });
        return movies.map(m => this.mapToResponse(m));
    }
    async findOneBySlug(slug) {
        const movie = await this.moviesRepo.findOne({ where: { slug } });
        if (!movie)
            throw new common_1.NotFoundException('Movie not found');
        return this.mapToResponse(movie);
    }
    async create(dto) {
        const movieData = this.mapFromDto(dto);
        const movie = this.moviesRepo.create(movieData);
        const saved = await this.moviesRepo.save(movie);
        return this.mapToResponse(saved);
    }
    async update(id, dto) {
        const movie = await this.moviesRepo.findOne({ where: { movie_id: id } });
        if (!movie)
            throw new common_1.NotFoundException('Movie not found');
        const updateData = this.mapFromDto(dto);
        Object.assign(movie, updateData);
        const updated = await this.moviesRepo.save(movie);
        return this.mapToResponse(updated);
    }
    async remove(id) {
        const result = await this.moviesRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Movie not found');
    }
    mapFromDto(dto) {
        const { media } = dto, rest = __rest(dto, ["media"]);
        const movie = Object.assign({}, rest);
        if (media) {
            if (media.image) {
                movie.movie_image = media.image.url;
                movie.poster_alt = media.image.alt;
            }
            if (media.video) {
                movie.trailer_url = media.video.url;
                movie.trailer_alt = media.video.alt;
            }
        }
        return movie;
    }
    mapToResponse(m) {
        return {
            id: m.movie_id,
            title: m.title,
            slug: m.slug,
            shortDescription: m.description_short,
            longDescription: m.description_long,
            releaseYear: m.year,
            countryId: m.country_id,
            rating: m.rating ? parseFloat(m.rating.toString()) : null,
            genreId: m.genre_id,
            ageGroup: m.age_group,
            actors: m.actors,
            director: m.director,
            isFeatured: m.featured,
            isFree: m.free,
            movieType: m.movie_type,
            contentType: m.type,
            ageRestriction: m.age_restriction,
            kidsRestriction: m.kids_restriction,
            videoUrl: m.url,
            trailerUrl: m.trailer_url,
            trailerAlt: m.trailer_alt,
            posterImage: m.movie_image,
            posterAlt: m.poster_alt,
            duration: m.duration,
            languages: m.languages,
            viewCount: m.view_count,
            isInteractive: m.is_interactive,
            interactiveMap: m.interactive_map,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
        };
    }
};
exports.MoviesService = MoviesService;
exports.MoviesService = MoviesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(movie_entity_1.Movie)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MoviesService);
//# sourceMappingURL=movies.service.js.map