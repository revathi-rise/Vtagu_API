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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
let SubscriptionsService = class SubscriptionsService {
    constructor(subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }
    async create(createSubscriptionDto) {
        try {
            const subscription = this.subscriptionRepository.create(createSubscriptionDto);
            subscription.payment_status = 'pending';
            subscription.status = 'active';
            subscription.created_at = new Date();
            const savedSubscription = await this.subscriptionRepository.save(subscription);
            return {
                status: true,
                message: 'Subscription created successfully',
                data: this.mapToResponse(savedSubscription),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findAll() {
        try {
            const subscriptions = await this.subscriptionRepository.find({
                relations: ['user'],
                order: { subscriptionId: 'DESC' },
            });
            return {
                status: true,
                message: 'Subscriptions fetched successfully',
                data: subscriptions.map(s => this.mapToResponse(s)),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async findOne(id) {
        try {
            const subscription = await this.subscriptionRepository.findOne({
                where: { subscriptionId: id },
                relations: ['user'],
            });
            if (!subscription) {
                throw new common_1.NotFoundException('Subscription not found');
            }
            return {
                status: true,
                message: 'Subscription fetched successfully',
                data: this.mapToResponse(subscription),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getActiveSubscription(userId) {
        try {
            const subscription = await this.subscriptionRepository.findOne({
                where: { userId, status: 'active' },
                relations: ['user'],
            });
            if (!subscription) {
                return {
                    status: true,
                    message: 'No active subscription found',
                    data: null,
                };
            }
            return {
                status: true,
                message: 'Active subscription fetched successfully',
                data: this.mapToResponse(subscription),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async update(id, updateSubscriptionDto) {
        try {
            const subscription = await this.subscriptionRepository.findOne({
                where: { subscriptionId: id },
            });
            if (!subscription) {
                throw new common_1.NotFoundException('Subscription not found');
            }
            Object.assign(subscription, updateSubscriptionDto);
            subscription.updated_at = new Date();
            if (updateSubscriptionDto.payment_status === 'success') {
                subscription.payment_timestamp = new Date();
            }
            const updatedSubscription = await this.subscriptionRepository.save(subscription);
            return {
                status: true,
                message: 'Subscription updated successfully',
                data: this.mapToResponse(updatedSubscription),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async cancel(id) {
        try {
            const subscription = await this.subscriptionRepository.findOne({
                where: { subscriptionId: id },
            });
            if (!subscription) {
                throw new common_1.NotFoundException('Subscription not found');
            }
            subscription.status = 'cancelled';
            subscription.updated_at = new Date();
            await this.subscriptionRepository.save(subscription);
            return { status: true, message: 'Subscription cancelled successfully' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getUserSubscriptionHistory(userId) {
        try {
            const subscriptions = await this.subscriptionRepository.find({
                where: { userId },
                relations: ['user'],
                order: { created_at: 'DESC' },
            });
            return {
                status: true,
                message: 'Subscription history fetched successfully',
                data: subscriptions.map(s => this.mapToResponse(s)),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    mapToResponse(subscription) {
        return {
            subscriptionId: subscription.subscriptionId,
            userId: subscription.userId,
            planId: subscription.planId,
            status: subscription.status,
            payment_status: subscription.payment_status,
            timestamp_from: subscription.timestamp_from,
            timestamp_to: subscription.timestamp_to,
            payment_method: subscription.payment_method,
            price_amount: Number(subscription.price_amount),
            paid_amount: Number(subscription.paid_amount),
            currency: subscription.currency,
        };
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map