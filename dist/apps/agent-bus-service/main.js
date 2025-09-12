/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/agent-bus-service/src/agents/agents.module.ts":
/*!************************************************************!*\
  !*** ./apps/agent-bus-service/src/agents/agents.module.ts ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AgentsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const persona_agent_1 = __webpack_require__(/*! ./persona.agent */ "./apps/agent-bus-service/src/agents/persona.agent.ts");
const handshake_agent_1 = __webpack_require__(/*! ./handshake.agent */ "./apps/agent-bus-service/src/agents/handshake.agent.ts");
const evaluation_agent_1 = __webpack_require__(/*! ./evaluation.agent */ "./apps/agent-bus-service/src/agents/evaluation.agent.ts");
const information_agent_service_1 = __webpack_require__(/*! ./services/information-agent.service */ "./apps/agent-bus-service/src/agents/services/information-agent.service.ts");
let AgentsModule = class AgentsModule {
};
exports.AgentsModule = AgentsModule;
exports.AgentsModule = AgentsModule = __decorate([
    (0, common_1.Module)({
        providers: [persona_agent_1.PersonaAgent, handshake_agent_1.HandshakeAgent, evaluation_agent_1.EvaluationAgent, information_agent_service_1.InformationAgentService],
        exports: [persona_agent_1.PersonaAgent, handshake_agent_1.HandshakeAgent, evaluation_agent_1.EvaluationAgent],
    })
], AgentsModule);


/***/ }),

/***/ "./apps/agent-bus-service/src/agents/evaluation.agent.ts":
/*!***************************************************************!*\
  !*** ./apps/agent-bus-service/src/agents/evaluation.agent.ts ***!
  \***************************************************************/
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
var EvaluationAgent_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvaluationAgent = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const llm_constants_1 = __webpack_require__(/*! ../constants/llm.constants */ "./apps/agent-bus-service/src/constants/llm.constants.ts");
let EvaluationAgent = EvaluationAgent_1 = class EvaluationAgent {
    getSystemPromptForAgent(agent) {
        switch (agent.toLowerCase()) {
            case 'information agent':
                return llm_constants_1.EVALUATION_SYSTEM_PROMPTS.INFORMATION_AGENT;
            default:
                return llm_constants_1.EVALUATION_SYSTEM_PROMPTS.DEFAULT(agent);
        }
    }
    constructor() {
        this.logger = new common_1.Logger(EvaluationAgent_1.name);
        this.MODEL_URL = 'https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview';
        this.API_KEY = 'C4nHEVwGLsfv20S6NSN7WWAJwK5MLkuWBlcvn2OcJb68IfS0uCESJQQJ99BCACHYHv6XJ3w3AAAAACOGolyT';
    }
    async evaluateConversation(request) {
        this.logger.log(`Evaluating conversation for session ${request.sessionID}`);
        try {
            const messagePairs = this.getMessagePairs(request.conversation);
            const messagePairEvaluations = await Promise.all(messagePairs.map(pair => this.evaluateMessagePair(pair, request)));
            const fullConversationEvaluation = await this.evaluateFullConversation(request, messagePairEvaluations);
            return {
                sessionID: request.sessionID,
                personaID: request.personaID,
                agent: request.agent,
                conversationEvaluation: fullConversationEvaluation
            };
        }
        catch (error) {
            this.logger.error(`Error evaluating conversation: ${error.message}`);
            throw error;
        }
    }
    getMessagePairs(conversation) {
        const pairs = [];
        for (let i = 0; i < conversation.length - 1; i += 2) {
            if (conversation[i].role === 'user' && conversation[i + 1]?.role === 'assistant') {
                pairs.push([conversation[i], conversation[i + 1]]);
            }
        }
        return pairs;
    }
    async evaluateMessagePair(pair, request) {
        const [userMessage, assistantMessage] = pair;
        const prompt = llm_constants_1.EVALUATION_MESSAGE_PAIR_PROMPT
            .replace('{agent}', request.agent)
            .replace('{scenario}', request.scenario)
            .replace('{userMessage}', userMessage.content)
            .replace('{assistantMessage}', assistantMessage.content);
        const result = await this.callLLM(prompt, request.agent);
        const { metrics } = this.parseEvaluationResult(result);
        return {
            userMessage: userMessage.content,
            assistantMessage: assistantMessage.content,
            metrics
        };
    }
    async evaluateFullConversation(request, messagePairEvaluations) {
        const formattedConversation = request.conversation
            .map((msg, idx) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n');
        const prompt = llm_constants_1.EVALUATION_FULL_CONVERSATION_PROMPT
            .replace('{agent}', request.agent)
            .replace('{scenario}', request.scenario)
            .replace('{conversation}', formattedConversation);
        const result = await this.callLLM(prompt, request.agent);
        const { metrics, overallAssessment } = this.parseEvaluationResult(result, true);
        return {
            metrics,
            overallAssessment,
            messagePairEvaluations
        };
    }
    async callLLM(prompt, agent) {
        try {
            const response = await axios_1.default.post(this.MODEL_URL, {
                messages: [
                    {
                        role: 'system',
                        content: this.getSystemPromptForAgent(agent),
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.API_KEY,
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            this.handleLlmError(error);
            throw new Error(`LLM API call failed: ${error.message}`);
        }
    }
    parseEvaluationResult(evaluationText, isFullConversation = false) {
        try {
            const metrics = {
                intentUnderstanding: this.extractMetric(evaluationText, 'INTENT_UNDERSTANDING'),
                relevance: this.extractMetric(evaluationText, 'RELEVANCE'),
                completeness: this.extractMetric(evaluationText, 'COMPLETENESS'),
                clarity: this.extractMetric(evaluationText, 'CLARITY'),
                proactivity: this.extractMetric(evaluationText, 'PROACTIVITY'),
                helpfulness: this.extractMetric(evaluationText, 'HELPFULNESS')
            };
            if (isFullConversation) {
                const overallMatch = evaluationText.match(/OVERALL_ASSESSMENT:\s*([\s\S]+?)(?=\n|$)/i);
                const overallAssessment = overallMatch ? overallMatch[1].trim() : 'No overall assessment provided.';
                return { metrics, overallAssessment };
            }
            return { metrics };
        }
        catch (error) {
            this.logger.error(`Error parsing evaluation result: ${error.message}`);
            return {
                metrics: this.getDefaultMetrics(),
                ...(isFullConversation && { overallAssessment: `Error parsing evaluation: ${error.message}` })
            };
        }
    }
    extractMetric(evaluationText, metricName) {
        const scoreMatch = evaluationText.match(new RegExp(`${metricName}_SCORE:\\s*(\\d+)`, 'i'));
        const justificationMatch = evaluationText.match(new RegExp(`${metricName}_JUSTIFICATION:\\s*([\\s\\S]+?)(?=\\n\\w+_SCORE:|$)`, 'i'));
        const score = scoreMatch ? Math.min(10, Math.max(0, parseInt(scoreMatch[1], 10))) : 5;
        const justification = justificationMatch ? justificationMatch[1].trim() : 'No justification provided.';
        return { score, justification };
    }
    getDefaultMetrics() {
        return {
            intentUnderstanding: { score: 5, justification: 'Error parsing metric.' },
            relevance: { score: 5, justification: 'Error parsing metric.' },
            completeness: { score: 5, justification: 'Error parsing metric.' },
            clarity: { score: 5, justification: 'Error parsing metric.' },
            proactivity: { score: 5, justification: 'Error parsing metric.' },
            helpfulness: { score: 5, justification: 'Error parsing metric.' }
        };
    }
    handleLlmError(error) {
        const axiosError = error;
        let errorMessage = 'Unknown LLM error';
        if (axiosError.response) {
            errorMessage = `LLM API error: Status ${axiosError.response.status}`;
            if (axiosError.response.data) {
                errorMessage += `, Message: ${JSON.stringify(axiosError.response.data)}`;
            }
        }
        else if (axiosError.request) {
            errorMessage = 'LLM API request failed: No response received';
        }
        else {
            errorMessage = `LLM API call setup error: ${axiosError.message}`;
        }
        this.logger.error(errorMessage);
    }
};
exports.EvaluationAgent = EvaluationAgent;
exports.EvaluationAgent = EvaluationAgent = EvaluationAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EvaluationAgent);


/***/ }),

/***/ "./apps/agent-bus-service/src/agents/handshake.agent.ts":
/*!**************************************************************!*\
  !*** ./apps/agent-bus-service/src/agents/handshake.agent.ts ***!
  \**************************************************************/
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
var HandshakeAgent_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandshakeAgent = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prompts_1 = __webpack_require__(/*! @langchain/core/prompts */ "@langchain/core/prompts");
const runnables_1 = __webpack_require__(/*! @langchain/core/runnables */ "@langchain/core/runnables");
const output_parsers_1 = __webpack_require__(/*! @langchain/core/output_parsers */ "@langchain/core/output_parsers");
const chat_models_1 = __webpack_require__(/*! @langchain/core/language_models/chat_models */ "@langchain/core/language_models/chat_models");
const messages_1 = __webpack_require__(/*! @langchain/core/messages */ "@langchain/core/messages");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const llm_constants_1 = __webpack_require__(/*! ../constants/llm.constants */ "./apps/agent-bus-service/src/constants/llm.constants.ts");
const information_agent_service_1 = __webpack_require__(/*! ./services/information-agent.service */ "./apps/agent-bus-service/src/agents/services/information-agent.service.ts");
class CustomLLM extends chat_models_1.BaseChatModel {
    constructor(persona) {
        super({});
        this.logger = new common_1.Logger(CustomLLM.name);
        this.MODEL_URL = process.env.HANDSHAKE_LLM_URL || 'https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview';
        this.API_KEY = process.env.HANDSHAKE_LLM_API_KEY || 'C4nHEVwGLsfv20S6NSN7WWAJwK5MLkuWBlcvn2OcJb68IfS0uCESJQQJ99BCACHYHv6XJ3w3AAAAACOGolyT';
        this.SYSTEM_PROMPT = 'You are responding as an Indian person with dynamic characteristics that will be provided to you. Your persona may include various fields like name, age, location, emotions, occupation, education, family details, and others - these will vary. Respond naturally based on ALL the characteristics given to you. Speak STRICTLY in ENGLISH ONLY. DO NOT use Hindi or any regional language words or phrases, not even for greetings or common expressions. Use only English words and phrases in your response. Avoid transliterations of Hindi or regional language words.';
        this.FALLBACK_RESPONSE = 'I need information about government schemes. Could you please help me?';
        this.persona = persona && typeof persona === 'object' ? persona : {};
        this.logger.log(`Initialized CustomLLM with persona: ${JSON.stringify(this.persona)}`);
    }
    async _generate(messages, options, runManager) {
        let messageContent = messages[messages.length - 1].content;
        messageContent = this.addEnglishOnlyInstruction(messageContent);
        try {
            const response = await axios_1.default.post(this.MODEL_URL, {
                messages: [
                    {
                        role: 'system',
                        content: this.SYSTEM_PROMPT,
                    },
                    {
                        role: 'user',
                        content: messageContent,
                    },
                ],
                temperature: 0.7,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.API_KEY,
                },
            });
            const content = response.data.choices[0].message.content;
            return {
                generations: [{
                        text: content,
                        message: new messages_1.AIMessage(content),
                    }],
            };
        }
        catch (error) {
            this.handleLlmError(error);
            return {
                generations: [{
                        text: this.FALLBACK_RESPONSE,
                        message: new messages_1.AIMessage(this.FALLBACK_RESPONSE),
                    }],
            };
        }
    }
    addEnglishOnlyInstruction(prompt) {
        return `${prompt}\n\nIMPORTANT: Consider ALL the persona characteristics provided when responding. Your response must be in ENGLISH ONLY. Do not use Hindi or any other Indian language words or phrases in your response, not even for greetings or common expressions. Always use English equivalents.`;
    }
    handleLlmError(error) {
        const axiosError = error;
        let errorMessage = 'Unknown LLM error';
        if (axiosError.response) {
            errorMessage = `LLM API error: Status ${axiosError.response.status}`;
            if (axiosError.response.data) {
                errorMessage += `, Message: ${JSON.stringify(axiosError.response.data)}`;
            }
        }
        else if (axiosError.request) {
            errorMessage = 'LLM API request failed: No response received';
        }
        else {
            errorMessage = `LLM API call setup error: ${axiosError.message}`;
        }
        this.logger.error(errorMessage);
        throw new Error(`LLM API call failed: ${axiosError.message}`);
    }
    _llmType() {
        return 'custom_llm';
    }
}
let HandshakeAgent = HandshakeAgent_1 = class HandshakeAgent {
    constructor(informationAgentService) {
        this.informationAgentService = informationAgentService;
        this.logger = new common_1.Logger(HandshakeAgent_1.name);
        this.MAX_RETRIES = 3;
        this.DEFAULT_DELAY = 1000;
        this.MAX_CONVERSATION_TURNS = 16;
        this.RECONNECTION_BUFFER_MS = 5000;
        this.DEFAULT_QUERY = "Hello, I need information about government schemes that might help me. Can you assist me?";
        this.DEFAULT_FOLLOW_UP = "Could you please explain more about what you just mentioned? I'm interested in learning more details.";
        this.CONVERSATION_DURATION_MS = 60000;
    }
    async processHandshake(createHandshakeDto) {
        this.logger.log(`Processing handshake for persona: ${createHandshakeDto.personaID}`);
        const persona = {
            personaID: createHandshakeDto.personaID,
            name: createHandshakeDto.name,
            emotions: createHandshakeDto.emotions || [],
            tone: createHandshakeDto.tone || [],
            scenario: createHandshakeDto.scenario
        };
        const baseCallSid = this.generateBaseCallSid(createHandshakeDto.sessionID);
        try {
            const personaId = 1;
            const stableCallSid = baseCallSid + (personaId * 10000);
            const conversationResult = await this.conductConversation(persona, personaId, stableCallSid, createHandshakeDto);
            this.informationAgentService.endSession(stableCallSid);
            return {
                sessionID: createHandshakeDto.sessionID,
                agentToSpeak: createHandshakeDto.agentToSpeak,
                personas: [conversationResult]
            };
        }
        catch (error) {
            this.logger.error(`Error in conversation: ${error instanceof Error ? error.message : String(error)}`);
            try {
                const personaId = 1;
                const stableCallSid = baseCallSid + (personaId * 10000);
                this.informationAgentService.endSession(stableCallSid);
            }
            catch { }
            const errorResult = {
                id: 1,
                emotions: createHandshakeDto.emotions || [],
                conversation: [],
                error: error instanceof Error ? error.message : String(error)
            };
            return {
                sessionID: createHandshakeDto.sessionID,
                agentToSpeak: createHandshakeDto.agentToSpeak,
                personas: [errorResult]
            };
        }
    }
    async conductConversation(persona, personaId, callSid, dto) {
        const validPersona = persona && typeof persona === 'object' ? persona : {};
        this.logger.log(`Starting conversation for persona ${personaId} with callSid: ${callSid}`);
        this.logger.debug(`Persona details: ${JSON.stringify(validPersona)}`);
        const callId = await this.establishSession(personaId, callSid);
        const llm = new CustomLLM(validPersona);
        const conversation = [];
        const endTime = Date.now() + this.CONVERSATION_DURATION_MS;
        const initialQuery = await this.generateInitialQuery(llm, validPersona, validPersona.scenario, personaId);
        const initialResponse = await this.sendMessageWithErrorHandling(initialQuery, callId, personaId, callSid);
        conversation.push({ role: 'user', content: initialQuery });
        conversation.push({ role: 'assistant', content: initialResponse });
        await this.continueConversation(conversation, endTime, llm, validPersona, personaId, callId, callSid);
        const result = {
            id: personaId,
            emotions: Array.isArray(validPersona.emotions) ? validPersona.emotions : [],
            conversation
        };
        Object.entries(validPersona).forEach(([key, value]) => {
            if (key !== 'emotions' && key !== 'conversation' && key !== 'id' && key !== 'error') {
                result[key] = value;
            }
        });
        return result;
    }
    async establishSession(personaId, callSid) {
        let retryCount = 0;
        while (retryCount < this.MAX_RETRIES) {
            try {
                const callId = await this.informationAgentService.startSession(callSid);
                this.logger.log(`Successfully established session for persona ${personaId}, callSid: ${callSid}, callId: ${callId}`);
                return callId;
            }
            catch (error) {
                retryCount++;
                if (retryCount >= this.MAX_RETRIES) {
                    throw new Error(`Failed to establish session for persona ${personaId} after ${this.MAX_RETRIES} attempts: ${error instanceof Error ? error.message : String(error)}`);
                }
                this.logger.warn(`Session creation attempt ${retryCount} for persona ${personaId} failed, retrying...`);
                await this.delay(this.DEFAULT_DELAY * retryCount);
            }
        }
        throw new Error(`Failed to establish session after ${this.MAX_RETRIES} attempts`);
    }
    async continueConversation(conversation, endTime, llm, persona, personaId, callId, callSid) {
        while (Date.now() < endTime) {
            if (conversation.length >= this.MAX_CONVERSATION_TURNS || (Date.now() + this.RECONNECTION_BUFFER_MS) >= endTime) {
                break;
            }
            const followUpQuery = await this.generateFollowUp(llm, persona, conversation, personaId);
            const response = await this.sendMessageWithErrorHandling(followUpQuery, callId, personaId, callSid);
            conversation.push({ role: 'user', content: followUpQuery });
            conversation.push({ role: 'assistant', content: response });
            await this.delay(this.DEFAULT_DELAY);
        }
    }
    formatPersonaCharacteristics(persona) {
        if (!persona)
            return 'Unknown characteristics';
        if (typeof persona !== 'object' || persona === null) {
            return `Persona: ${String(persona)}`;
        }
        const formattedLines = [];
        Object.entries(persona).forEach(([key, value]) => {
            if (value === undefined || value === null) {
                return;
            }
            else if (Array.isArray(value) && value.length === 0) {
                return;
            }
            else if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
                return;
            }
            if (typeof value === 'object') {
                if (!Array.isArray(value)) {
                    try {
                        const nestedValues = Object.entries(value)
                            .filter(([_, nestedValue]) => nestedValue !== undefined && nestedValue !== null)
                            .map(([nestedKey, nestedValue]) => `${nestedKey}: ${nestedValue}`)
                            .join(', ');
                        if (nestedValues) {
                            formattedLines.push(`${key}: ${nestedValues}`);
                        }
                    }
                    catch (error) {
                        formattedLines.push(`${key}: ${String(value)}`);
                    }
                }
                else if (Array.isArray(value) && value.length > 0) {
                    formattedLines.push(`${key}: ${value.join(', ')}`);
                }
            }
            else {
                formattedLines.push(`${key}: ${value}`);
            }
        });
        return formattedLines.join('\n');
    }
    async generateInitialQuery(llm, persona, scenario, personaId) {
        try {
            const personaPrompt = prompts_1.ChatPromptTemplate.fromTemplate(llm_constants_1.HANDSHAKE_INITIAL_PROMPT_TEMPLATE);
            const personaChain = runnables_1.RunnableSequence.from([
                personaPrompt,
                llm,
                new output_parsers_1.StringOutputParser(),
            ]);
            return await personaChain.invoke({
                personaCharacteristics: this.formatPersonaCharacteristics(persona),
                scenario
            });
        }
        catch (error) {
            this.logger.error(`Error generating initial query for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
            return this.DEFAULT_QUERY;
        }
    }
    async generateFollowUp(llm, persona, conversation, personaId) {
        try {
            const followUpPrompt = prompts_1.ChatPromptTemplate.fromTemplate(llm_constants_1.HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE);
            const followUpChain = runnables_1.RunnableSequence.from([
                followUpPrompt,
                llm,
                new output_parsers_1.StringOutputParser(),
            ]);
            return await followUpChain.invoke({
                personaCharacteristics: this.formatPersonaCharacteristics(persona),
                conversation: conversation.map(msg => `${msg.role === 'user' ? 'You' : 'Agent'}: ${msg.content}`).join('\n')
            });
        }
        catch (error) {
            this.logger.error(`Error generating follow-up query for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
            return this.DEFAULT_FOLLOW_UP;
        }
    }
    async sendMessageWithErrorHandling(message, callId, personaId, callSid) {
        try {
            this.logger.log(`Sending message for persona ${personaId}, callId: ${callId}`);
            return await this.informationAgentService.sendMessage(message, callId);
        }
        catch (error) {
            this.logger.error(`Error sending message for persona ${personaId}: ${error instanceof Error ? error.message : String(error)}`);
            const errorResponse = `Error: ${error instanceof Error ? error.message : String(error)}`;
            await this.attemptReconnection(error, personaId, callSid);
            return errorResponse;
        }
    }
    async attemptReconnection(error, personaId, callSid) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (errorMsg.includes('No response received') || errorMsg.includes('Failed to send message')) {
            this.logger.warn(`Attempting to reconnect for persona ${personaId} due to error`);
            const newCallId = await this.informationAgentService.reconnect(callSid);
            if (newCallId) {
                this.logger.log(`Reconnected for persona ${personaId} with new callId: ${newCallId}`);
            }
        }
    }
    parseDuration(durationString) {
        const match = durationString.match(/(\d+)\s+(second|minute|hour)s?/i);
        if (!match)
            return 30;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'second': return value;
            case 'minute': return value * 60;
            case 'hour': return value * 3600;
            default: return 30;
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    generateBaseCallSid(sessionId) {
        if (sessionId === undefined || sessionId === null) {
            return Date.now();
        }
        const parsed = parseInt(sessionId.toString(), 10);
        if (!Number.isNaN(parsed)) {
            return parsed * 1000000;
        }
        const str = sessionId.toString();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        const positiveHash = Math.abs(hash);
        return (positiveHash % 1000000000) * 1000 + (Date.now() % 1000);
    }
};
exports.HandshakeAgent = HandshakeAgent;
exports.HandshakeAgent = HandshakeAgent = HandshakeAgent_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof information_agent_service_1.InformationAgentService !== "undefined" && information_agent_service_1.InformationAgentService) === "function" ? _a : Object])
], HandshakeAgent);


/***/ }),

/***/ "./apps/agent-bus-service/src/agents/persona.agent.ts":
/*!************************************************************!*\
  !*** ./apps/agent-bus-service/src/agents/persona.agent.ts ***!
  \************************************************************/
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
exports.PersonaAgent = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const prompts_1 = __webpack_require__(/*! @langchain/core/prompts */ "@langchain/core/prompts");
const runnables_1 = __webpack_require__(/*! @langchain/core/runnables */ "@langchain/core/runnables");
const output_parsers_1 = __webpack_require__(/*! @langchain/core/output_parsers */ "@langchain/core/output_parsers");
const chat_models_1 = __webpack_require__(/*! @langchain/core/language_models/chat_models */ "@langchain/core/language_models/chat_models");
const messages_1 = __webpack_require__(/*! @langchain/core/messages */ "@langchain/core/messages");
const llm_constants_1 = __webpack_require__(/*! ../constants/llm.constants */ "./apps/agent-bus-service/src/constants/llm.constants.ts");
const axios_1 = __webpack_require__(/*! axios */ "axios");
class CustomLLM extends chat_models_1.BaseChatModel {
    async _generate(messages, options, runManager) {
        const messageContent = messages[messages.length - 1].content;
        try {
            const response = await axios_1.default.post('https://harsh-m84onpva-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview', {
                messages: [
                    {
                        role: 'user',
                        content: messageContent,
                    },
                ],
                temperature: 0.7,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': 'C4nHEVwGLsfv20S6NSN7WWAJwK5MLkuWBlcvn2OcJb68IfS0uCESJQQJ99BCACHYHv6XJ3w3AAAAACOGolyT',
                },
            });
            const content = response.data.choices[0].message.content;
            console.log(content);
            return {
                generations: [{
                        text: content,
                        message: new messages_1.AIMessage(content),
                    }],
            };
        }
        catch (error) {
            throw new Error(`LLM API call failed: ${error.message}`);
        }
    }
    _llmType() {
        return 'custom_llm';
    }
}
let PersonaAgent = class PersonaAgent {
    constructor() {
        this.llm = new CustomLLM({});
        const personaPrompt = prompts_1.ChatPromptTemplate.fromTemplate(llm_constants_1.PERSONA_PROMPT_TEMPLATE);
        this.personaChain = runnables_1.RunnableSequence.from([
            personaPrompt,
            this.llm,
            new output_parsers_1.StringOutputParser(),
        ]);
    }
    async generatePersonas(createPersonaDto) {
        try {
            const result = await this.personaChain.invoke({
                count: createPersonaDto.count,
                name: createPersonaDto.name,
                emotions: JSON.stringify(createPersonaDto.emotions),
                tone: JSON.stringify(createPersonaDto.tone),
                scenario: createPersonaDto.scenario,
                sessionID: createPersonaDto.sessionID,
            });
            try {
                const parsedResult = JSON.parse(result);
                if (parsedResult.personas && Array.isArray(parsedResult.personas)) {
                    parsedResult.personas = parsedResult.personas.map((persona, index) => ({
                        id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
                        ...persona
                    }));
                    return parsedResult;
                }
                else if (Array.isArray(parsedResult)) {
                    return parsedResult.map((persona, index) => ({
                        id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
                        ...persona
                    }));
                }
                else {
                    return parsedResult;
                }
            }
            catch (error) {
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResult = JSON.parse(jsonMatch[0]);
                    if (parsedResult.personas && Array.isArray(parsedResult.personas)) {
                        parsedResult.personas = parsedResult.personas.map((persona, index) => ({
                            id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
                            ...persona
                        }));
                        return parsedResult;
                    }
                    else if (Array.isArray(parsedResult)) {
                        return parsedResult.map((persona, index) => ({
                            id: `persona-${createPersonaDto.sessionID}-${Date.now()}-${index}`,
                            ...persona
                        }));
                    }
                    else {
                        return parsedResult;
                    }
                }
                throw new Error(`Invalid JSON response from LLM: ${result.substring(0, 100)}...`);
            }
        }
        catch (error) {
            throw new Error(`Failed to generate personas: ${error.message}`);
        }
    }
};
exports.PersonaAgent = PersonaAgent;
exports.PersonaAgent = PersonaAgent = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PersonaAgent);


/***/ }),

/***/ "./apps/agent-bus-service/src/agents/services/information-agent.service.ts":
/*!*********************************************************************************!*\
  !*** ./apps/agent-bus-service/src/agents/services/information-agent.service.ts ***!
  \*********************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InformationAgentService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InformationAgentService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const axios_1 = __webpack_require__(/*! axios */ "axios");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
let InformationAgentService = InformationAgentService_1 = class InformationAgentService {
    constructor() {
        this.logger = new common_1.Logger(InformationAgentService_1.name);
        this.baseUrl = process.env.INFORMATION_AGENT_BASE_URL || 'https://modelops1.centralindia.cloudapp.azure.com/api/golden-faq-eligibility-chat/chat';
        this.authToken = process.env.INFORMATION_AGENT_AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJoYXJzaGEiLCJleHAiOjE3NzY4NDA4NDN9.nXFhEdzd_LxFzvK7WboyKXb3AlzqM0VNT-xJygXZw1Q';
        this.modelName = process.env.INFORMATION_AGENT_MODEL_NAME || 'microsoft/Phi-4';
        this.DEFAULT_TIMEOUT = parseInt(process.env.INFORMATION_AGENT_TIMEOUT_MS || '20000', 10);
        this.MAX_RETRIES = parseInt(process.env.INFORMATION_AGENT_MAX_RETRIES || '3', 10);
        this.sessionMap = new Map();
        this.historyMap = new Map();
    }
    async startSession(callSid) {
        try {
            if (this.sessionMap.has(callSid)) {
                this.logger.log(`Reusing existing session for callSid: ${callSid}`);
                return callSid;
            }
            const sessionId = (0, uuid_1.v4)();
            this.logger.log(`Starting new session with ID: ${sessionId} for callSid: ${callSid}`);
            this.sessionMap.set(callSid, sessionId);
            this.historyMap.set(sessionId, []);
            return callSid;
        }
        catch (error) {
            this.handleApiError(error, 'Failed to start Information Agent session');
            throw error;
        }
    }
    endSession(callSid) {
        const sessionId = this.sessionMap.get(callSid);
        if (sessionId) {
            this.historyMap.delete(sessionId);
            this.sessionMap.delete(callSid);
            this.logger.log(`Ended session for callSid: ${callSid}`);
        }
    }
    async sendMessage(query, callId) {
        let retries = 0;
        while (retries < this.MAX_RETRIES) {
            try {
                const sessionId = this.sessionMap.get(callId);
                if (!sessionId) {
                    throw new Error(`No session found for callId: ${callId}`);
                }
                const history = this.historyMap.get(sessionId) || [];
                this.logger.log(`Sending message to Information Agent for callId: ${callId}, sessionId: ${sessionId} (attempt ${retries + 1}/${this.MAX_RETRIES})`);
                this.logger.debug(`Query: ${query}`);
                const timestamp = new Date().toISOString();
                const payload = {
                    message: query,
                    history: history,
                    model_name: this.modelName,
                    stages: null,
                    relevant_contexts: [],
                    stage: "identify",
                    context_variables: {
                        session_id: sessionId,
                        relevant_contexts: [],
                        scheme: "all"
                    },
                    search_query: ""
                };
                const response = await this.makeApiRequest(payload);
                history.push({
                    role: 'user',
                    content: query,
                    timestamp: timestamp
                });
                history.push({
                    role: 'assistant',
                    content: response.data.response,
                    timestamp: new Date().toISOString()
                });
                this.historyMap.set(sessionId, history);
                return response.data.response;
            }
            catch (error) {
                retries++;
                if (this.shouldRetry(error, retries)) {
                    await this.delay(this.calculateBackoff(retries));
                    continue;
                }
                throw error;
            }
        }
        throw new Error(`Failed to send message after ${this.MAX_RETRIES} attempts`);
    }
    async reconnect(callSid) {
        try {
            const oldSessionId = this.sessionMap.get(callSid);
            if (oldSessionId) {
                this.historyMap.delete(oldSessionId);
            }
            this.sessionMap.delete(callSid);
            this.logger.log(`Attempting to reconnect with same callSid: ${callSid}`);
            const callId = await this.startSession(callSid);
            return callId;
        }
        catch (error) {
            this.logger.error(`Reconnection failed: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async makeApiRequest(data) {
        return (0, axios_1.default)({
            method: 'post',
            url: this.baseUrl,
            data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            },
            timeout: this.DEFAULT_TIMEOUT
        });
    }
    handleApiError(error, baseErrorMessage) {
        const axiosError = error;
        if (axiosError.response) {
            this.logger.error(`API error - Status: ${axiosError.response.status}, Data: ${JSON.stringify(axiosError.response.data)}`);
            throw new Error(`${baseErrorMessage}: ${axiosError.message}`);
        }
        else if (axiosError.request) {
            this.logger.error('API error - No response received from server');
            throw new Error(`${baseErrorMessage}: No response received from server`);
        }
        else {
            this.logger.error(`API error: ${axiosError.message}`);
            throw new Error(`${baseErrorMessage}: ${axiosError.message}`);
        }
    }
    shouldRetry(error, retries) {
        const axiosError = error;
        if (retries >= this.MAX_RETRIES) {
            return false;
        }
        if (axiosError.response) {
            if (axiosError.response.status === 500) {
                this.logger.error(`Server error (500) - Data: ${JSON.stringify(axiosError.response.data || {})}`);
                throw new Error(`Server Error: ${JSON.stringify(axiosError.response.data || {})}`);
            }
            return true;
        }
        else if (axiosError.request) {
            this.logger.error(`No response received (attempt ${retries}/${this.MAX_RETRIES})`);
            return true;
        }
        this.logger.error(`Request setup error: ${axiosError.message}`);
        throw new Error(`Failed to send message to Information Agent: ${axiosError.message}`);
    }
    calculateBackoff(retryCount) {
        return Math.pow(2, retryCount) * 1000;
    }
};
exports.InformationAgentService = InformationAgentService;
exports.InformationAgentService = InformationAgentService = InformationAgentService_1 = __decorate([
    (0, common_1.Injectable)()
], InformationAgentService);


/***/ }),

/***/ "./apps/agent-bus-service/src/app.module.ts":
/*!**************************************************!*\
  !*** ./apps/agent-bus-service/src/app.module.ts ***!
  \**************************************************/
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
const persona_module_1 = __webpack_require__(/*! ./domain/persona/persona.module */ "./apps/agent-bus-service/src/domain/persona/persona.module.ts");
const persona_controller_1 = __webpack_require__(/*! ./domain/persona/persona.controller */ "./apps/agent-bus-service/src/domain/persona/persona.controller.ts");
const handshake_module_1 = __webpack_require__(/*! ./domain/handshake/handshake.module */ "./apps/agent-bus-service/src/domain/handshake/handshake.module.ts");
const handshake_controller_1 = __webpack_require__(/*! ./domain/handshake/handshake.controller */ "./apps/agent-bus-service/src/domain/handshake/handshake.controller.ts");
const evaluation_module_1 = __webpack_require__(/*! ./domain/evaluation/evaluation.module */ "./apps/agent-bus-service/src/domain/evaluation/evaluation.module.ts");
const evaluation_controller_1 = __webpack_require__(/*! ./domain/evaluation/evaluation.controller */ "./apps/agent-bus-service/src/domain/evaluation/evaluation.controller.ts");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            persona_module_1.PersonaModule,
            handshake_module_1.HandshakeModule,
            evaluation_module_1.EvaluationModule,
        ],
        controllers: [
            persona_controller_1.PersonaController,
            handshake_controller_1.HandshakeController,
            evaluation_controller_1.EvaluationController,
        ],
    })
], AppModule);


/***/ }),

/***/ "./apps/agent-bus-service/src/constants/llm.constants.ts":
/*!***************************************************************!*\
  !*** ./apps/agent-bus-service/src/constants/llm.constants.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EVALUATION_FULL_CONVERSATION_PROMPT = exports.EVALUATION_MESSAGE_PAIR_PROMPT = exports.EVALUATION_SYSTEM_PROMPTS = exports.HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE = exports.HANDSHAKE_INITIAL_PROMPT_TEMPLATE = exports.PERSONA_PROMPT_TEMPLATE = void 0;
exports.PERSONA_PROMPT_TEMPLATE = `
  You are an AI assistant that creates detailed personas based on given parameters.
  Create {count} unique personas with the following requirements:

  Name field:
  {name}

  Emotions to choose from:
  {emotions}

  Tone to choose from:
  {tone} 

  Scenario context:
  {scenario}

  IMPORTANT: You must respond with VALID JSON ONLY. Do not include any explanatory text outside the JSON.
  Format your response as a valid JSON object with this exact structure:
  {{
    "sessionID": {sessionID},
    "personas": [
      {{
        "name": "Full name of the persona",
        "age": 35,
        "tone": "one tone from the provided list",
        "emotions": ["1-2 emotions from the provided list"],
        "background": "Brief background relevant to the scenario",
        "personality": "Brief personality description"
      }},
      // More personas...
    ]
  }}
`;
exports.HANDSHAKE_INITIAL_PROMPT_TEMPLATE = `
  You are acting as a person with the following characteristics:
  {personaCharacteristics}
  
  Scenario: {scenario}
  
  Given your persona and the scenario above, generate a realistic question or statement that you would make to an information agent about government schemes, benefits, or services in India. 
  
  Your response should:
  1. Reflect ALL aspects of your persona's characteristics as listed above
  2. Be conversational and natural
  3. Be appropriate for the given scenario
  4. Be directly related to seeking information about government schemes or services
  5. MUST BE STRICTLY IN ENGLISH ONLY - avoid any Hindi words, phrases, or transliterations
  6. Use simple, clear English appropriate for your persona's background and education level

  IMPORTANT INSTRUCTIONS:
  - Consider ALL characteristics provided in your persona (not just name, age, location, emotions)
  - Incorporate relevant details from any custom fields that were provided in your persona
  - Even though your persona is Indian, you MUST respond in ENGLISH ONLY
  - DO NOT use any Hindi words or phrases (such as namaste, namaskar, dhanyavad, etc.)
  - DO NOT use Devanagari script or characters
  - If you would normally include a Hindi greeting or phrase, replace it with an English equivalent
  - Think of yourself as an Indian person who speaks only English
  
  Respond with ONLY the exact message you would say, nothing else.
`;
exports.HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE = `
  You are acting as a person with the following characteristics:
  {personaCharacteristics}
  
  This is the conversation so far:
  {conversation}
  
  Given your persona and the conversation so far, generate a realistic follow-up question or statement.
  Your response should:
  1. Be a natural continuation of the conversation
  2. Reflect ALL aspects of your persona's characteristics as listed above
  3. Be directly related to the previous exchange
  4. Ask for clarification or more details about what the agent has told you
  5. MUST BE STRICTLY IN ENGLISH ONLY - avoid any Hindi words, phrases, or transliterations
  6. Use simple, clear English appropriate for your persona's background and education level

  IMPORTANT INSTRUCTIONS:
  - Consider ALL characteristics provided in your persona (not just name, age, location, emotions)
  - Incorporate relevant details from any custom fields that were provided in your persona
  - Even though your persona is Indian, you MUST respond in ENGLISH ONLY
  - DO NOT use any Hindi words or phrases (such as namaste, namaskar, dhanyavad, etc.)
  - DO NOT use Devanagari script or characters
  - If you would normally include a Hindi greeting or phrase, replace it with an English equivalent
  - Think of yourself as an Indian person who speaks only English
  
  Respond with ONLY the exact message you would say, nothing else.
`;
exports.EVALUATION_SYSTEM_PROMPTS = {
    INFORMATION_AGENT: `You are an expert evaluator of conversations between users and an information agent specializing in Indian government schemes and benefits.
Your task is to evaluate how well the agent provides accurate, helpful, and relevant information about government programs, eligibility criteria, and application processes.
Focus on assessing the clarity, completeness, and accessibility of the information provided.`,
    DEFAULT: (agentType) => `You are an expert evaluator of conversations between users and an ${agentType}.
Your task is to score each conversation and provide detailed justification for your score.`
};
exports.EVALUATION_MESSAGE_PAIR_PROMPT = `
Evaluate this single interaction about government schemes between a user and the {agent}.

Context: {scenario}

User: {userMessage}
Assistant: {assistantMessage}

Please evaluate this interaction on the following metrics (score each 0-10):
1. Intent Understanding - How well the response aligns with user's intent
2. Relevance - How relevant the information is to the query
3. Completeness - How complete and comprehensive the response is
4. Clarity - How clear and easy to understand the response is
5. Proactivity - How well it anticipates follow-up needs
6. Helpfulness - How practically useful the information is

For each metric provide:
1. A numeric score (0-10)
2. A 2-3 line justification

Format your response exactly as follows:
INTENT_UNDERSTANDING_SCORE: [score]
INTENT_UNDERSTANDING_JUSTIFICATION: [2-3 line justification]
RELEVANCE_SCORE: [score]
RELEVANCE_JUSTIFICATION: [2-3 line justification]
COMPLETENESS_SCORE: [score]
COMPLETENESS_JUSTIFICATION: [2-3 line justification]
CLARITY_SCORE: [score]
CLARITY_JUSTIFICATION: [2-3 line justification]
PROACTIVITY_SCORE: [score]
PROACTIVITY_JUSTIFICATION: [2-3 line justification]
HELPFULNESS_SCORE: [score]
HELPFULNESS_JUSTIFICATION: [2-3 line justification]
`;
exports.EVALUATION_FULL_CONVERSATION_PROMPT = `
Evaluate this complete conversation about government schemes between a user and the {agent}.

Context: {scenario}

Conversation:
{conversation}

Please evaluate the overall conversation on the following metrics (score each 0-10):
1. Intent Understanding - Overall grasp of user's needs across conversation
2. Relevance - Consistency in providing relevant information
3. Completeness - Comprehensive coverage of the topic
4. Clarity - Consistent clarity throughout exchanges
5. Proactivity - Anticipation of needs throughout conversation
6. Helpfulness - Overall practical value of the conversation

For each metric provide:
1. A numeric score (0-10)
2. A 2-3 line justification

Additionally, provide a 2-3 line overall conversation assessment.

Format your response exactly as follows:
INTENT_UNDERSTANDING_SCORE: [score]
INTENT_UNDERSTANDING_JUSTIFICATION: [2-3 line justification]
RELEVANCE_SCORE: [score]
RELEVANCE_JUSTIFICATION: [2-3 line justification]
COMPLETENESS_SCORE: [score]
COMPLETENESS_JUSTIFICATION: [2-3 line justification]
CLARITY_SCORE: [score]
CLARITY_JUSTIFICATION: [2-3 line justification]
PROACTIVITY_SCORE: [score]
PROACTIVITY_JUSTIFICATION: [2-3 line justification]
HELPFULNESS_SCORE: [score]
HELPFULNESS_JUSTIFICATION: [2-3 line justification]
OVERALL_ASSESSMENT: [2-3 line summary of the entire conversation]
`;


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation-template.dto.ts":
/*!********************************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation-template.dto.ts ***!
  \********************************************************************************************/
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CreateEvaluationTemplateDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class CreateEvaluationTemplateDto {
}
exports.CreateEvaluationTemplateDto = CreateEvaluationTemplateDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateEvaluationTemplateDto.prototype, "sessionID", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_b = typeof Express !== "undefined" && (_a = Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object)
], CreateEvaluationTemplateDto.prototype, "file", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluationTemplateDto.prototype, "buffer", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluationTemplateDto.prototype, "originalname", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluationTemplateDto.prototype, "mimetype", void 0);


/***/ }),

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

/***/ "./apps/agent-bus-service/src/domain/evaluation/evaluation.controller.ts":
/*!*******************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/evaluation/evaluation.controller.ts ***!
  \*******************************************************************************/
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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvaluationController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const evaluation_service_1 = __webpack_require__(/*! ./evaluation.service */ "./apps/agent-bus-service/src/domain/evaluation/evaluation.service.ts");
const create_evaluation_dto_1 = __webpack_require__(/*! ./dto/create-evaluation.dto */ "./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation.dto.ts");
const create_evaluation_template_dto_1 = __webpack_require__(/*! ./dto/create-evaluation-template.dto */ "./apps/agent-bus-service/src/domain/evaluation/dto/create-evaluation-template.dto.ts");
let EvaluationController = class EvaluationController {
    constructor(evaluationService) {
        this.evaluationService = evaluationService;
    }
    async evaluateConversations(createEvaluationDto) {
        return this.evaluationService.evaluateConversations(createEvaluationDto);
    }
    async uploadEvaluationTemplate(fileData) {
        return this.evaluationService.uploadEvaluationTemplate(fileData);
    }
    async getEvaluationTemplate(sessionID) {
        return this.evaluationService.getEvaluationTemplate(sessionID);
    }
};
exports.EvaluationController = EvaluationController;
__decorate([
    (0, microservices_1.MessagePattern)('evaluateConversations'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_evaluation_dto_1.CreateEvaluationDto !== "undefined" && create_evaluation_dto_1.CreateEvaluationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], EvaluationController.prototype, "evaluateConversations", null);
__decorate([
    (0, microservices_1.MessagePattern)('uploadEvaluationTemplate'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof create_evaluation_template_dto_1.CreateEvaluationTemplateDto !== "undefined" && create_evaluation_template_dto_1.CreateEvaluationTemplateDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], EvaluationController.prototype, "uploadEvaluationTemplate", null);
__decorate([
    (0, microservices_1.MessagePattern)('getEvaluationTemplate'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], EvaluationController.prototype, "getEvaluationTemplate", null);
exports.EvaluationController = EvaluationController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof evaluation_service_1.EvaluationService !== "undefined" && evaluation_service_1.EvaluationService) === "function" ? _a : Object])
], EvaluationController);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/evaluation/evaluation.module.ts":
/*!***************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/evaluation/evaluation.module.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvaluationModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const evaluation_controller_1 = __webpack_require__(/*! ./evaluation.controller */ "./apps/agent-bus-service/src/domain/evaluation/evaluation.controller.ts");
const evaluation_service_1 = __webpack_require__(/*! ./evaluation.service */ "./apps/agent-bus-service/src/domain/evaluation/evaluation.service.ts");
const agents_module_1 = __webpack_require__(/*! ../../agents/agents.module */ "./apps/agent-bus-service/src/agents/agents.module.ts");
let EvaluationModule = class EvaluationModule {
};
exports.EvaluationModule = EvaluationModule;
exports.EvaluationModule = EvaluationModule = __decorate([
    (0, common_1.Module)({
        imports: [agents_module_1.AgentsModule],
        controllers: [evaluation_controller_1.EvaluationController],
        providers: [evaluation_service_1.EvaluationService],
        exports: [evaluation_service_1.EvaluationService],
    })
], EvaluationModule);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/evaluation/evaluation.service.ts":
/*!****************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/evaluation/evaluation.service.ts ***!
  \****************************************************************************/
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
var EvaluationService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EvaluationService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const evaluation_agent_1 = __webpack_require__(/*! ../../agents/evaluation.agent */ "./apps/agent-bus-service/src/agents/evaluation.agent.ts");
const XLSX = __webpack_require__(/*! xlsx */ "xlsx");
const NodeCache = __webpack_require__(/*! node-cache */ "node-cache");
let EvaluationService = EvaluationService_1 = class EvaluationService {
    constructor(evaluationAgent) {
        this.evaluationAgent = evaluationAgent;
        this.logger = new common_1.Logger(EvaluationService_1.name);
        this.templateCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
    }
    async evaluateConversations(createEvaluationDto) {
        this.logger.log(`Processing evaluation request for session ${createEvaluationDto.sessionID}`);
        try {
            if (!Array.isArray(createEvaluationDto.conversation) || createEvaluationDto.conversation.length === 0) {
                this.logger.warn('No conversation provided for evaluation');
                throw new Error('No conversation provided for evaluation');
            }
            const result = await this.evaluationAgent.evaluateConversation({
                sessionID: createEvaluationDto.sessionID,
                personaID: createEvaluationDto.personaID,
                agent: createEvaluationDto.agent,
                conversation: createEvaluationDto.conversation,
                scenario: createEvaluationDto.scenario
            });
            this.logger.log(`Evaluation processed successfully for session ${createEvaluationDto.sessionID}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error processing evaluation: ${error.message}`);
            throw error;
        }
    }
    async uploadEvaluationTemplate(fileData) {
        this.logger.log(`Uploading evaluation template for session ${fileData.sessionID}`);
        try {
            if (!fileData.buffer && !fileData.file?.buffer) {
                throw new Error('No file data provided');
            }
            const cacheKey = `template_${fileData.sessionID}`;
            let buffer = fileData.buffer;
            let originalname = fileData.originalname;
            let mimetype = fileData.mimetype;
            if (fileData.file) {
                buffer = fileData.file.buffer.toString('base64');
                originalname = fileData.file.originalname;
                mimetype = fileData.file.mimetype;
            }
            const templateData = {
                buffer,
                originalname,
                mimetype,
                uploadedAt: new Date()
            };
            const success = this.templateCache.set(cacheKey, templateData);
            if (!success) {
                throw new Error('Failed to cache template data');
            }
            this.logger.log(`Template data cached successfully for session ${fileData.sessionID}`);
            return {
                success: true,
                sessionID: fileData.sessionID,
                filename: originalname,
                message: 'Evaluation template uploaded and cached successfully'
            };
        }
        catch (error) {
            this.logger.error(`Error caching template data: ${error.message}`);
            throw error;
        }
    }
    getEvaluationTemplate(sessionID) {
        try {
            const cacheKey = `template_${sessionID}`;
            const templateData = this.templateCache.get(cacheKey);
            if (!templateData) {
                this.logger.warn(`No template found for session ${sessionID}`);
                return null;
            }
            const buffer = Buffer.from(templateData.buffer, 'base64');
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: ['traits', 'definition', 'level1', 'level2', 'level3', 'level4', 'level5'],
                range: 1
            });
            this.logger.log('=== Evaluation Template Data ===');
            this.logger.log(`Total rows found: ${jsonData.length}`);
            const tableRows = jsonData.map((row, index) => {
                return `
Row ${index + 1}:
  Trait: ${row.traits}
  Definition: ${row.definition}
  Level 1: ${row.level1}
  Level 2: ${row.level2}
  Level 3: ${row.level3}
  Level 4: ${row.level4}
  Level 5: ${row.level5}
----------------------------------------`;
            });
            tableRows.forEach((row) => {
                this.logger.log(row);
            });
            this.logger.log('=== End of Template Data ===');
            this.logger.log(`Successfully parsed template data for session ${sessionID}`);
            return {
                success: true,
                sessionID,
                filename: templateData.originalname,
                data: jsonData,
                originalTemplate: templateData
            };
        }
        catch (error) {
            this.logger.error(`Error parsing template data: ${error.message}`);
            throw error;
        }
    }
};
exports.EvaluationService = EvaluationService;
exports.EvaluationService = EvaluationService = EvaluationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof evaluation_agent_1.EvaluationAgent !== "undefined" && evaluation_agent_1.EvaluationAgent) === "function" ? _a : Object])
], EvaluationService);


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

/***/ "./apps/agent-bus-service/src/domain/handshake/handshake.controller.ts":
/*!*****************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/handshake/handshake.controller.ts ***!
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandshakeController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const handshake_service_1 = __webpack_require__(/*! ./handshake.service */ "./apps/agent-bus-service/src/domain/handshake/handshake.service.ts");
const create_handshake_dto_1 = __webpack_require__(/*! ./dto/create-handshake.dto */ "./apps/agent-bus-service/src/domain/handshake/dto/create-handshake.dto.ts");
let HandshakeController = class HandshakeController {
    constructor(handshakeService) {
        this.handshakeService = handshakeService;
    }
    async processHandshake(createHandshakeDto) {
        return this.handshakeService.processHandshake(createHandshakeDto);
    }
};
exports.HandshakeController = HandshakeController;
__decorate([
    (0, microservices_1.MessagePattern)('processHandshake'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_handshake_dto_1.CreateHandshakeDto !== "undefined" && create_handshake_dto_1.CreateHandshakeDto) === "function" ? _b : Object]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], HandshakeController.prototype, "processHandshake", null);
exports.HandshakeController = HandshakeController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof handshake_service_1.HandshakeService !== "undefined" && handshake_service_1.HandshakeService) === "function" ? _a : Object])
], HandshakeController);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/handshake/handshake.module.ts":
/*!*************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/handshake/handshake.module.ts ***!
  \*************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandshakeModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const handshake_controller_1 = __webpack_require__(/*! ./handshake.controller */ "./apps/agent-bus-service/src/domain/handshake/handshake.controller.ts");
const handshake_service_1 = __webpack_require__(/*! ./handshake.service */ "./apps/agent-bus-service/src/domain/handshake/handshake.service.ts");
const agents_module_1 = __webpack_require__(/*! ../../agents/agents.module */ "./apps/agent-bus-service/src/agents/agents.module.ts");
let HandshakeModule = class HandshakeModule {
};
exports.HandshakeModule = HandshakeModule;
exports.HandshakeModule = HandshakeModule = __decorate([
    (0, common_1.Module)({
        imports: [agents_module_1.AgentsModule],
        controllers: [handshake_controller_1.HandshakeController],
        providers: [handshake_service_1.HandshakeService],
        exports: [handshake_service_1.HandshakeService],
    })
], HandshakeModule);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/handshake/handshake.service.ts":
/*!**************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/handshake/handshake.service.ts ***!
  \**************************************************************************/
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
var HandshakeService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HandshakeService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const handshake_agent_1 = __webpack_require__(/*! ../../agents/handshake.agent */ "./apps/agent-bus-service/src/agents/handshake.agent.ts");
let HandshakeService = HandshakeService_1 = class HandshakeService {
    constructor(handshakeAgent) {
        this.handshakeAgent = handshakeAgent;
        this.logger = new common_1.Logger(HandshakeService_1.name);
    }
    async processHandshake(createHandshakeDto) {
        this.logger.log(`Processing handshake request for session ${createHandshakeDto.sessionID}`);
        try {
            const result = await this.handshakeAgent.processHandshake(createHandshakeDto);
            this.logger.log(`Handshake processed successfully for session ${createHandshakeDto.sessionID}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Error processing handshake: ${error.message}`);
            throw error;
        }
    }
};
exports.HandshakeService = HandshakeService;
exports.HandshakeService = HandshakeService = HandshakeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof handshake_agent_1.HandshakeAgent !== "undefined" && handshake_agent_1.HandshakeAgent) === "function" ? _a : Object])
], HandshakeService);


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

/***/ "./apps/agent-bus-service/src/domain/persona/persona.controller.ts":
/*!*************************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/persona/persona.controller.ts ***!
  \*************************************************************************/
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
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonaController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const persona_service_1 = __webpack_require__(/*! ./persona.service */ "./apps/agent-bus-service/src/domain/persona/persona.service.ts");
const create_persona_dto_1 = __webpack_require__(/*! ./dto/create-persona.dto */ "./apps/agent-bus-service/src/domain/persona/dto/create-persona.dto.ts");
let PersonaController = PersonaController_1 = class PersonaController {
    constructor(personaService) {
        this.personaService = personaService;
        this.logger = new common_1.Logger(PersonaController_1.name);
    }
    async generatePersonas(createPersonaDto) {
        try {
            const personas = await this.personaService.generatePersonas(createPersonaDto);
            return personas;
        }
        catch (error) {
            this.logger.error(`Failed to get response from persona service: ${error.message}`);
            throw new Error(`Failed to get response from persona service: ${error.message}`);
        }
    }
};
exports.PersonaController = PersonaController;
__decorate([
    (0, microservices_1.MessagePattern)('generatePersonas'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof create_persona_dto_1.CreatePersonaDto !== "undefined" && create_persona_dto_1.CreatePersonaDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], PersonaController.prototype, "generatePersonas", null);
exports.PersonaController = PersonaController = PersonaController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [typeof (_a = typeof persona_service_1.PersonaService !== "undefined" && persona_service_1.PersonaService) === "function" ? _a : Object])
], PersonaController);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/persona/persona.module.ts":
/*!*********************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/persona/persona.module.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonaModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const persona_agent_1 = __webpack_require__(/*! ../../agents/persona.agent */ "./apps/agent-bus-service/src/agents/persona.agent.ts");
const persona_controller_1 = __webpack_require__(/*! ./persona.controller */ "./apps/agent-bus-service/src/domain/persona/persona.controller.ts");
const persona_service_1 = __webpack_require__(/*! ./persona.service */ "./apps/agent-bus-service/src/domain/persona/persona.service.ts");
let PersonaModule = class PersonaModule {
};
exports.PersonaModule = PersonaModule;
exports.PersonaModule = PersonaModule = __decorate([
    (0, common_1.Module)({
        imports: [],
        controllers: [persona_controller_1.PersonaController],
        providers: [persona_service_1.PersonaService, persona_agent_1.PersonaAgent],
        exports: [persona_service_1.PersonaService]
    })
], PersonaModule);


/***/ }),

/***/ "./apps/agent-bus-service/src/domain/persona/persona.service.ts":
/*!**********************************************************************!*\
  !*** ./apps/agent-bus-service/src/domain/persona/persona.service.ts ***!
  \**********************************************************************/
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
var PersonaService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PersonaService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const persona_agent_1 = __webpack_require__(/*! ../../agents/persona.agent */ "./apps/agent-bus-service/src/agents/persona.agent.ts");
let PersonaService = PersonaService_1 = class PersonaService {
    constructor(personaAgent) {
        this.personaAgent = personaAgent;
        this.logger = new common_1.Logger(PersonaService_1.name);
    }
    async generatePersonas(createPersonaDto) {
        try {
            const personas = await this.personaAgent.generatePersonas(createPersonaDto);
            return personas;
        }
        catch (error) {
            this.logger.error(`Failed to generate personas: ${error.message}`);
            throw new Error(`Failed to generate personas: ${error.message}`);
        }
    }
};
exports.PersonaService = PersonaService;
exports.PersonaService = PersonaService = PersonaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof persona_agent_1.PersonaAgent !== "undefined" && persona_agent_1.PersonaAgent) === "function" ? _a : Object])
], PersonaService);


/***/ }),

/***/ "@langchain/core/language_models/chat_models":
/*!**************************************************************!*\
  !*** external "@langchain/core/language_models/chat_models" ***!
  \**************************************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/language_models/chat_models");

/***/ }),

/***/ "@langchain/core/messages":
/*!*******************************************!*\
  !*** external "@langchain/core/messages" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/messages");

/***/ }),

/***/ "@langchain/core/output_parsers":
/*!*************************************************!*\
  !*** external "@langchain/core/output_parsers" ***!
  \*************************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/output_parsers");

/***/ }),

/***/ "@langchain/core/prompts":
/*!******************************************!*\
  !*** external "@langchain/core/prompts" ***!
  \******************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/prompts");

/***/ }),

/***/ "@langchain/core/runnables":
/*!********************************************!*\
  !*** external "@langchain/core/runnables" ***!
  \********************************************/
/***/ ((module) => {

module.exports = require("@langchain/core/runnables");

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

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

module.exports = require("axios");

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

/***/ "node-cache":
/*!*****************************!*\
  !*** external "node-cache" ***!
  \*****************************/
/***/ ((module) => {

module.exports = require("node-cache");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),

/***/ "xlsx":
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("xlsx");

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
/*!********************************************!*\
  !*** ./apps/agent-bus-service/src/main.ts ***!
  \********************************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const app_module_1 = __webpack_require__(/*! ./app.module */ "./apps/agent-bus-service/src/app.module.ts");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
async function bootstrap() {
    const logger = new common_1.Logger('AgentBusService');
    const host = process.env.AGENT_BUS_HOST || '0.0.0.0';
    const port = process.env.AGENT_BUS_PORT ? parseInt(process.env.AGENT_BUS_PORT, 10) : 3001;
    const app = await core_1.NestFactory.createMicroservice(app_module_1.AppModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host,
            port,
        },
    });
    await app.listen();
    logger.log(`Agent Bus Service is listening on TCP ${host}:${port}`);
}
bootstrap();

})();

/******/ })()
;