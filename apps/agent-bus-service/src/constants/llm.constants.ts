export const PERSONA_PROMPT_TEMPLATE = `
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

export const HANDSHAKE_INITIAL_PROMPT_TEMPLATE = `
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

export const HANDSHAKE_FOLLOWUP_PROMPT_TEMPLATE = `
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

export const EVALUATION_SYSTEM_PROMPTS = {
  INFORMATION_AGENT: `You are an expert evaluator of conversations between users and an information agent specializing in Indian government schemes and benefits.
Your task is to evaluate how well the agent provides accurate, helpful, and relevant information about government programs, eligibility criteria, and application processes.
Focus on assessing the clarity, completeness, and accessibility of the information provided.`,

  DEFAULT: (agentType: string) => `You are an expert evaluator of conversations between users and an ${agentType}.
Your task is to score each conversation and provide detailed justification for your score.`
};

export const EVALUATION_MESSAGE_PAIR_PROMPT = `
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

export const EVALUATION_FULL_CONVERSATION_PROMPT = `
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
