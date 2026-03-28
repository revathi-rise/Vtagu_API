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
exports.Poster = void 0;
const typeorm_1 = require("typeorm");
let Poster = class Poster {
};
exports.Poster = Poster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ name: 'poster_id' }),
    __metadata("design:type", Number)
], Poster.prototype, "poster_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250 }),
    __metadata("design:type", String)
], Poster.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 250, nullable: true }),
    __metadata("design:type", String)
], Poster.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'char', length: 2, default: 'A' }),
    __metadata("design:type", String)
], Poster.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', name: 'createdon', nullable: true }),
    __metadata("design:type", Date)
], Poster.prototype, "createdon", void 0);
exports.Poster = Poster = __decorate([
    (0, typeorm_1.Entity)('posters')
], Poster);
//# sourceMappingURL=poster.entity.js.map