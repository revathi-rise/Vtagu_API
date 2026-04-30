"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveMoviesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const interactive_movies_service_1 = require("./interactive-movies.service");
const interactive_movies_controller_1 = require("./interactive-movies.controller");
const interactive_movie_entity_1 = require("./entities/interactive-movie.entity");
let InteractiveMoviesModule = class InteractiveMoviesModule {
};
exports.InteractiveMoviesModule = InteractiveMoviesModule;
exports.InteractiveMoviesModule = InteractiveMoviesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([interactive_movie_entity_1.InteractiveMovie])],
        providers: [interactive_movies_service_1.InteractiveMoviesService],
        controllers: [interactive_movies_controller_1.InteractiveMoviesController]
    })
], InteractiveMoviesModule);
//# sourceMappingURL=interactive-movies.module.js.map