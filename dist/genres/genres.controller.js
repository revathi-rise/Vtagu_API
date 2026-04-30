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
exports.GenresController = void 0;
const common_1 = require("@nestjs/common");
const genres_service_1 = require("./genres.service");
let GenresController = class GenresController {
    constructor(service) {
        this.service = service;
    }
    async getForHome(limit) {
        try {
            const l = limit ? parseInt(limit, 10) : 10;
            const data = await this.service.findForHome(l);
            return { status: true, message: 'Genres fetched successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    async getAll() {
        try {
            const data = await this.service.findAll();
            return { status: true, message: 'Genres fetched successfully', data };
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
    create() {
        try {
            throw new common_1.MethodNotAllowedException('Write operations are disabled');
        }
        catch (error) {
            return { status: false, message: error.message || 'An error occurred', data: null };
        }
    }
};
exports.GenresController = GenresController;
__decorate([
    (0, common_1.Get)('home'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GenresController.prototype, "getForHome", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GenresController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], GenresController.prototype, "create", null);
exports.GenresController = GenresController = __decorate([
    (0, common_1.Controller)('genres'),
    __metadata("design:paramtypes", [genres_service_1.GenresService])
], GenresController);
//# sourceMappingURL=genres.controller.js.map