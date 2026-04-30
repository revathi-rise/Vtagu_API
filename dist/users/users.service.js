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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async register(registerDto) {
        try {
            const existingUser = await this.usersRepository.findOne({ where: { email: registerDto.email } });
            if (existingUser) {
                throw new common_1.BadRequestException('Email already registered');
            }
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);
            const otp = this.generateOtp();
            const user = this.usersRepository.create({
                email: registerDto.email,
                user_name: registerDto.user_name,
                password: hashedPassword,
                mobile: registerDto.mobile || null,
                type: registerDto.type || 'email',
                otp,
                status: 'active',
                register_step: 1,
            });
            const savedUser = await this.usersRepository.save(user);
            console.log(`OTP for ${registerDto.email}: ${otp}`);
            return {
                status: true,
                message: 'User registered successfully. OTP sent to email.',
                data: this.mapUserToResponse(savedUser),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async verifyOtp(verifyOtpDto) {
        try {
            const user = await this.usersRepository.findOne({ where: { email: verifyOtpDto.email } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (user.otp !== verifyOtpDto.otp) {
                throw new common_1.BadRequestException('Invalid OTP');
            }
            user.otp_verified = true;
            user.otp = null;
            user.register_step = 2;
            const updatedUser = await this.usersRepository.save(user);
            return {
                status: true,
                message: 'OTP verified successfully',
                data: this.mapUserToResponse(updatedUser),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async login(loginDto, ipAddress) {
        try {
            const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            if (!user.otp_verified) {
                throw new common_1.BadRequestException('Please verify OTP first');
            }
            user.logged_in = true;
            user.log_count = (user.log_count || 0) + 1;
            user.last_login_ip_address = ipAddress;
            user.user_session = this.generateSessionToken();
            const updatedUser = await this.usersRepository.save(user);
            return {
                status: true,
                message: 'Login successful',
                data: this.mapUserToResponse(updatedUser),
                token: updatedUser.user_session,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(error.message);
        }
    }
    async logout(userId) {
        try {
            const user = await this.usersRepository.findOne({ where: { userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            user.logged_in = false;
            user.user_session = null;
            await this.usersRepository.save(user);
            return { status: true, message: 'Logout successful' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async forgotPassword(forgotPasswordDto) {
        try {
            const user = await this.usersRepository.findOne({ where: { email: forgotPasswordDto.email } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const otp = this.generateOtp();
            user.forgot_otp = otp;
            await this.usersRepository.save(user);
            console.log(`Forgot Password OTP for ${forgotPasswordDto.email}: ${otp}`);
            return { status: true, message: 'OTP sent to email' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async resetPassword(resetPasswordDto) {
        try {
            const user = await this.usersRepository.findOne({ where: { email: resetPasswordDto.email } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (user.forgot_otp !== resetPasswordDto.otp) {
                throw new common_1.BadRequestException('Invalid OTP');
            }
            user.password = await bcrypt.hash(resetPasswordDto.new_password, 10);
            user.forgot_otp = null;
            await this.usersRepository.save(user);
            return { status: true, message: 'Password reset successful' };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getUserProfile(userId) {
        try {
            const user = await this.usersRepository.findOne({ where: { userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return {
                status: true,
                message: 'User profile fetched successfully',
                data: this.mapUserToResponse(user),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async updateUserProfile(userId, updateUserDto) {
        try {
            const user = await this.usersRepository.findOne({ where: { userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            Object.assign(user, updateUserDto);
            const updatedUser = await this.usersRepository.save(user);
            return {
                status: true,
                message: 'User profile updated successfully',
                data: this.mapUserToResponse(updatedUser),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getUserByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    generateSessionToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    mapUserToResponse(user) {
        return {
            userId: user.userId,
            email: user.email,
            user_name: user.user_name,
            mobile: user.mobile,
            age: user.age,
            gender: user.gender,
            profile_picture: user.profile_picture,
            status: user.status,
            plan: user.plan,
            logged_in: user.logged_in,
            last_login_ip_address: user.last_login_ip_address,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map