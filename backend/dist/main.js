"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
    .then(() => {
    console.log(`Server is running on port ${process.env.PORT ?? 3000}`);
})
    .catch((error) => {
    console.error('Error starting the server:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map