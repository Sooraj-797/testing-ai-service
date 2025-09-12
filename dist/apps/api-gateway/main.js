/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto.ts":
/*!***********************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto.ts ***!
  \***********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateEvaluationDto = exports.ConversationMessage = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const class_transformer_1 = __webpack_require__(/*! class-transformer */ "class-transformer");
class ConversationMessage {
}
exports.ConversationMessage = ConversationMessage;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsIn)(['user', 'assistant']),
    __metadata("design:type", String)
], ConversationMessage.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConversationMessage.prototype, "content", void 0);
class CreateEvaluationDto {
}
exports.CreateEvaluationDto = CreateEvaluationDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateEvaluationDto.prototype, "sessionID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "personaID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "agent", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConversationMessage),
    __metadata("design:type", Array)
], CreateEvaluationDto.prototype, "conversation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEvaluationDto.prototype, "scenario", void 0);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto.ts":
/*!*********************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto.ts ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateHandshakeDto = exports.DynamicField = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class DynamicField {
}
exports.DynamicField = DynamicField;
class CreateHandshakeDto {
}
exports.CreateHandshakeDto = CreateHandshakeDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateHandshakeDto.prototype, "sessionID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHandshakeDto.prototype, "agentToSpeak", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHandshakeDto.prototype, "personaID", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHandshakeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateHandshakeDto.prototype, "emotions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateHandshakeDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHandshakeDto.prototype, "scenario", void 0);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/persona/dto/create-persona.dto.ts":
/*!*****************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/persona/dto/create-persona.dto.ts ***!
  \*****************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreatePersonaDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class CreatePersonaDto {
}
exports.CreatePersonaDto = CreatePersonaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePersonaDto.prototype, "sessionID", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreatePersonaDto.prototype, "count", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePersonaDto.prototype, "emotions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreatePersonaDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePersonaDto.prototype, "scenario", void 0);


/***/ }),

/***/ "./apps/api-gateway/src/app.module.ts":
/*!********************************************!*\
  !*** ./apps/api-gateway/src/app.module.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const agent_bus_module_1 = __webpack_require__(/*! ./domain/agent-bus-service/agent-bus.module */ "./apps/api-gateway/src/domain/agent-bus-service/agent-bus.module.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            agent_bus_module_1.AgentBusModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);


/***/ }),

/***/ "./apps/api-gateway/src/domain/agent-bus-service/agent-bus.module.ts":
/*!***************************************************************************!*\
  !*** ./apps/api-gateway/src/domain/agent-bus-service/agent-bus.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AgentBusModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const persona_controller_1 = __webpack_require__(/*! ./persona/persona.controller */ "./apps/api-gateway/src/domain/agent-bus-service/persona/persona.controller.ts");
const handshake_controller_1 = __webpack_require__(/*! ./handshake/handshake.controller */ "./apps/api-gateway/src/domain/agent-bus-service/handshake/handshake.controller.ts");
const evaluation_controller_1 = __webpack_require__(/*! ./evaluation/evaluation.controller */ "./apps/api-gateway/src/domain/agent-bus-service/evaluation/evaluation.controller.ts");
let AgentBusModule = class AgentBusModule {
};
exports.AgentBusModule = AgentBusModule;
exports.AgentBusModule = AgentBusModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: 'AGENT_BUS_SERVICE',
                    transport: microservices_1.Transport.TCP,
                    options: {
                        host: process.env.AGENT_BUS_HOST || 'localhost',
                        port: process.env.AGENT_BUS_PORT ? parseInt(process.env.AGENT_BUS_PORT, 10) : 3001,
                    },
                },
            ]),
        ],
        controllers: [persona_controller_1.PersonaController, handshake_controller_1.HandshakeController, evaluation_controller_1.EvaluationController],
    })
], AgentBusModule);


/***/ }),

/***/ "./apps/api-gateway/src/domain/agent-bus-service/evaluation/evaluation.controller.ts":
/*!*******************************************************************************************!*\
  !*** ./apps/api-gateway/src/domain/agent-bus-service/evaluation/evaluation.controller.ts ***!
  \*******************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var EvaluationController_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvaluationController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const create_evaluation_dto_1 = __webpack_require__(/*! apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto */ "./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto.ts");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
const platform_express_1 = __webpack_require__(/*! @nestjs/platform-express */ "@nestjs/platform-express");
const express_1 = __webpack_require__(/*! express */ "express");
const path = __webpack_require__(/*! path */ "path");
let EvaluationController = EvaluationController_1 = class EvaluationController {
    constructor(evaluationService) {
        this.evaluationService = evaluationService;
        this.logger = new common_1.Logger(EvaluationController_1.name);
    }
    async evaluateConversation(createEvaluationDto) {
        this.logger.log(`Received evaluation request for session ${createEvaluationDto.sessionID}`);
        try {
            const result = await (0, rxjs_1.firstValueFrom)(this.evaluationService.send('evaluateConversations', createEvaluationDto));
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get response from evaluation service: ${error.message}`);
            throw error;
        }
    }
    async uploadEvaluationTemplate(file, body) {
        try {
            const allowedExtensions = ['.xlsx', '.xls', '.csv'];
            const fileExtension = path.extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                throw new common_1.HttpException(`Invalid file extension. Allowed extensions are: ${allowedExtensions.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const fileData = {
                sessionID: parseInt(body.sessionID.toString(), 10),
                file,
                buffer: file.buffer.toString('base64'),
                originalname: file.originalname,
                mimetype: file.mimetype
            };
            this.logger.log(`Uploading template file ${file.originalname} for session ${fileData.sessionID}`);
            const result = await (0, rxjs_1.firstValueFrom)(this.evaluationService.send('uploadEvaluationTemplate', fileData));
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to upload template: ${error.message}`);
            throw error;
        }
    }
};
exports.EvaluationController = EvaluationController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_evaluation_dto_1.CreateEvaluationDto !== "undefined" && create_evaluation_dto_1.CreateEvaluationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], EvaluationController.prototype, "evaluateConversation", null);
__decorate([
    (0, common_1.Post)('upload-template'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
        fileIsRequired: true,
    }))),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_e = typeof express_1.Express !== "undefined" && (_d = express_1.Express.Multer) !== void 0 && _d.File) === "function" ? _e : Object, Object]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], EvaluationController.prototype, "uploadEvaluationTemplate", null);
exports.EvaluationController = EvaluationController = EvaluationController_1 = __decorate([
    (0, common_1.Controller)('evaluation'),
    __param(0, (0, common_1.Inject)('AGENT_BUS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], EvaluationController);


/***/ }),

/***/ "./apps/api-gateway/src/domain/agent-bus-service/handshake/handshake.controller.ts":
/*!*****************************************************************************************!*\
  !*** ./apps/api-gateway/src/domain/agent-bus-service/handshake/handshake.controller.ts ***!
  \*****************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var HandshakeController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandshakeController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const create_handshake_dto_1 = __webpack_require__(/*! apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto */ "./apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto.ts");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let HandshakeController = HandshakeController_1 = class HandshakeController {
    constructor(handshakeService) {
        this.handshakeService = handshakeService;
        this.logger = new common_1.Logger(HandshakeController_1.name);
    }
    async conductConversation(createHandshakeDto) {
        this.logger.log(`Received handshake request for session ${createHandshakeDto.sessionID}`);
        const result = await (0, rxjs_1.firstValueFrom)(this.handshakeService.send('processHandshake', createHandshakeDto));
        return result;
    }
};
exports.HandshakeController = HandshakeController;
__decorate([
    (0, common_1.Post)('conversation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_handshake_dto_1.CreateHandshakeDto !== "undefined" && create_handshake_dto_1.CreateHandshakeDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], HandshakeController.prototype, "conductConversation", null);
exports.HandshakeController = HandshakeController = HandshakeController_1 = __decorate([
    (0, common_1.Controller)('handshake'),
    __param(0, (0, common_1.Inject)('AGENT_BUS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], HandshakeController);


/***/ }),

/***/ "./apps/api-gateway/src/domain/agent-bus-service/persona/persona.controller.ts":
/*!*************************************************************************************!*\
  !*** ./apps/api-gateway/src/domain/agent-bus-service/persona/persona.controller.ts ***!
  \*************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
var PersonaController_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const create_persona_dto_1 = __webpack_require__(/*! apps/agent-bus-service/src/domain/persona/dto/create-persona.dto */ "./apps/agent-bus-service/src/domain/persona/dto/create-persona.dto.ts");
const rxjs_1 = __webpack_require__(/*! rxjs */ "rxjs");
let PersonaController = PersonaController_1 = class PersonaController {
    constructor(agentBusService) {
        this.agentBusService = agentBusService;
        this.logger = new common_1.Logger(PersonaController_1.name);
    }
    async generatePersonas(createPersonaDto) {
        try {
            this.logger.log(`Generating personas with data: ${JSON.stringify(createPersonaDto)}`);
            const result = await (0, rxjs_1.firstValueFrom)(this.agentBusService.send('generatePersonas', createPersonaDto));
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to get response from persona service: ${error.message}`);
            throw new Error(`Failed to get response from persona service: ${error.message}`);
        }
    }
};
exports.PersonaController = PersonaController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_persona_dto_1.CreatePersonaDto !== "undefined" && create_persona_dto_1.CreatePersonaDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], PersonaController.prototype, "generatePersonas", null);
exports.PersonaController = PersonaController = PersonaController_1 = __decorate([
    (0, common_1.Controller)('persona'),
    __param(0, (0, common_1.Inject)('AGENT_BUS_SERVICE')),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], PersonaController);


/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "@nestjs/platform-express":
/*!*******************************************!*\
  !*** external "@nestjs/platform-express" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@nestjs/platform-express");

/***/ }),

/***/ "class-transformer":
/*!************************************!*\
  !*** external "class-transformer" ***!
  \************************************/
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "rxjs":
/*!***********************!*\
  !*** external "rxjs" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**************************************!*\
  !*** ./apps/api-gateway/src/main.ts ***!
  \**************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/api-gateway/src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const express_1 = __webpack_require__(/*! express */ "express");
async function bootstrap() {
    const logger = new common_1.Logger('ApiGateway');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.use((0, express_1.json)({ limit: '10mb' }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`API Gateway is running on port ${port}`);
    logger.log(`API documentation available at http://localhost:${port}/api`);
}
bootstrap();

})();

/******/ })()
;