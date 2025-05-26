# Agent Bus Service

A service for managing and orchestrating AI agents, including a persona generation agent.

## Overview

The Agent Bus Service provides functionality for creating and managing various AI agents. Currently, it includes a Persona Agent that can generate multiple fictional personas based on various parameters using a custom LLM API.

## Features

- Generate multiple fictional personas with customizable attributes
- Define constraints on persona attributes
- Specify emotional traits for the generated personas
- Resilient LLM API interaction with retry mechanism

## Architecture

The service follows a modular NestJS architecture:

```
src/
├── agents/
│   ├── persona.agent.ts       # Persona generation agent
│   └── agents.module.ts       # Module for all agents
├── domain/
│   ├── agent-bus/             # Agent bus domain module
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── agent-bus.controller.ts
│   │   ├── agent-bus.service.ts
│   │   └── agent-bus.module.ts
│   └── llm/                   # LLM service domain module
│       ├── llm.config.ts      # LLM configuration
│       ├── llm.service.ts     # Service for interacting with LLM API
│       └── llm.module.ts
└── app.module.ts              # Main application module
```

## API Endpoints

### Create Persona

- **Endpoint**: `/agent-bus/create-persona`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "count": 2,
    "context": "High school students in a science class",
    "fields": ["name", "age", "gender", "personality", "interests", "academic_strengths"],
    "constraints": {
      "age": [15, 16, 17, 18],
      "gender": ["male", "female", "non-binary"]
    },
    "scenario": "Working together on a science project",
    "emotions": ["excited", "curious", "ambitious"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "personas": [
      {
        "name": "Emily Chen",
        "age": 16,
        "gender": "female",
        "personality": "detail-oriented and analytical",
        "interests": "chemistry, violin, photography",
        "academic_strengths": "chemistry, mathematics"
      },
      {
        "name": "Marcus Johnson",
        "age": 17,
        "gender": "male",
        "personality": "creative and enthusiastic",
        "interests": "robotics, skateboarding, video games",
        "academic_strengths": "physics, computer science"
      }
    ]
  }
  ```

## LLM Integration

The service integrates with an external LLM API:
- API Endpoint: https://dev.ird.mu-sigma.com/genaimodel/litellm/v1/chat/completions
- Model: meta-llama/Meta-Llama-3-8B-Instruct

## Configuration

Configuration for the LLM service is defined in `src/domain/llm/llm.config.ts`:

```typescript
export const LLM_CONFIG = {
    API_URL: 'https://dev.ird.mu-sigma.com/genaimodel/litellm/v1/chat/completions',
    DEFAULT_MODEL: 'meta-llama/Meta-Llama-3-8B-Instruct',
    REQUEST_TIMEOUT: 60000, // 60 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
};
``` 