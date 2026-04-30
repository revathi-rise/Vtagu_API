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
exports.Episode = void 0;
const typeorm_1 = require("typeorm");
let Episode = class Episode {
};
exports.Episode = Episode;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'episode_id' }),
    __metadata("design:type", Number)
], Episode.prototype, "episodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'season_id' }),
    __metadata("design:type", Number)
], Episode.prototype, "seasonId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Episode.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Episode.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Episode.prototype, "image", void 0);
exports.Episode = Episode = __decorate([
    (0, typeorm_1.Entity)('episode')
], Episode);
//# sourceMappingURL=episode.entity.js.map