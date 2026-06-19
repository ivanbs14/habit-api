"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
    app.use((req, res, next) => {
        const startedAt = Date.now();
        console.log(`[http] ${req.method} ${req.url} start`);
        res.on('finish', () => {
            const durationMs = Date.now() - startedAt;
            console.log(`[http] ${req.method} ${req.url} -> ${res.statusCode} ${durationMs}ms`);
        });
        res.on('close', () => {
            const durationMs = Date.now() - startedAt;
            console.log(`[http] ${req.method} ${req.url} close finished=${res.writableEnded} ${durationMs}ms`);
        });
        next();
    });
    await app.listen(3000, '0.0.0.0');
}
void bootstrap();
//# sourceMappingURL=main.js.map