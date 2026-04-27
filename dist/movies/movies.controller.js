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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesController = void 0;
const common_1 = require("@nestjs/common");
const movies_service_1 = require("./movies.service");
const movies_dto_1 = require("./movies.dto");
let MoviesController = class MoviesController {
    constructor(moviesService) {
        this.moviesService = moviesService;
    }
    async create(createMovieDto) {
        try {
            const data = await this.moviesService.create(createMovieDto);
            return { status: true, message: 'Movie created successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async findAll() {
        try {
            const data = await this.moviesService.findAll();
            return { status: true, message: 'Movies fetched successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async getTrending(limit) {
        try {
            const l = limit ? parseInt(limit, 10) : 10;
            const data = await this.moviesService.findForHome(l);
            return { status: true, message: 'Trending movies fetched successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async findOne(slug) {
        try {
            const data = await this.moviesService.findOneBySlug(slug);
            return { status: true, message: 'Movie fetched successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async update(id, updateMovieDto) {
        try {
            const data = await this.moviesService.update(+id, updateMovieDto);
            return { status: true, message: 'Movie updated successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async remove(id) {
        try {
            await this.moviesService.remove(+id);
            return { status: true, message: 'Movie deleted successfully', data: null };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
};
exports.MoviesController = MoviesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [movies_dto_1.CreateMovieDto]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, movies_dto_1.UpdateMovieDto]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MoviesController.prototype, "remove", null);
exports.MoviesController = MoviesController = __decorate([
    (0, common_1.Controller)('movies'),
    __metadata("design:paramtypes", [movies_service_1.MoviesService])
], MoviesController);
//# sourceMappingURL=movies.controller.js.map