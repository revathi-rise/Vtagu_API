"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const movies_module_1 = require("./movies/movies.module");
const posters_module_1 = require("./posters/posters.module");
const choices_module_1 = require("./choices/choices.module");
const scenes_module_1 = require("./scenes/scenes.module");
const movie_entity_1 = require("./movies/movie.entity");
const poster_entity_1 = require("./posters/poster.entity");
const choice_entity_1 = require("./choices/entities/choice.entity");
const scene_entity_1 = require("./scenes/entities/scene.entity");
const interactive_movies_module_1 = require("./interactive-movies/interactive-movies.module");
const interactive_movie_entity_1 = require("./interactive-movies/entities/interactive-movie.entity");
const genres_module_1 = require("./genres/genres.module");
const genre_entity_1 = require("./genres/genre.entity");
const content_entity_1 = require("./content/entities/content.entity");
const content_module_1 = require("./content/content.module");
const episodes_module_1 = require("./episodes/episodes.module");
const episode_entity_1 = require("./episodes/episode.entity");
const users_module_1 = require("./users/users.module");
const user_entity_1 = require("./users/entities/user.entity");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const subscription_entity_1 = require("./subscriptions/entities/subscription.entity");
const user_devices_module_1 = require("./user-devices/user-devices.module");
const user_device_entity_1 = require("./user-devices/entities/user-device.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '3306'),
                username: process.env.DB_USER || 'root',
                password: process.env.DB_PASS || '',
                database: process.env.DB_NAME || 'vtagu',
                entities: [
                    movie_entity_1.Movie,
                    poster_entity_1.Poster,
                    genre_entity_1.Genre,
                    content_entity_1.Content,
                    scene_entity_1.Scene,
                    choice_entity_1.Choice,
                    interactive_movie_entity_1.InteractiveMovie,
                    episode_entity_1.Episode,
                    user_entity_1.User,
                    subscription_entity_1.Subscription,
                    user_device_entity_1.UserDevice,
                ],
                synchronize: false,
            }),
            movies_module_1.MoviesModule,
            posters_module_1.PostersModule,
            choices_module_1.ChoicesModule,
            scenes_module_1.ScenesModule,
            genres_module_1.GenresModule,
            content_module_1.ContentModule,
            interactive_movies_module_1.InteractiveMoviesModule,
            episodes_module_1.EpisodesModule,
            users_module_1.UsersModule,
            subscriptions_module_1.SubscriptionsModule,
            user_devices_module_1.UserDevicesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map