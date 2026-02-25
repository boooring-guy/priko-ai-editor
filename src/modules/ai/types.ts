export interface Root {
  response: Response;
}

export interface Response {
  _output: string;
  steps: Step[];
  totalUsage: TotalUsage;
}

export interface Step {
  content: Content[];
  finishReason: string;
  model: Model;
  providerMetadata: ProviderMetadata;
  rawFinishReason: string;
  request: Request;
  response: Response2;
  stepNumber: number;
  usage: Usage;
  warnings: any[];
}

export interface Content {
  text: string;
  type: string;
}

export interface Model {
  modelId: string;
  provider: string;
}

export interface ProviderMetadata {
  google: Google;
}

export interface Google {
  groundingMetadata: any;
  promptFeedback: any;
  safetyRatings: any;
  urlContextMetadata: any;
  usageMetadata: UsageMetadata;
}

export interface UsageMetadata {
  candidatesTokenCount: number;
  promptTokenCount: number;
  thoughtsTokenCount: number;
  totalTokenCount: number;
}

export interface Request {
  body: Body;
}

export interface Body {
  contents: Content2[];
  generationConfig: GenerationConfig;
}

export interface Content2 {
  parts: Part[];
  role: string;
}

export interface Part {
  text: string;
}

export interface GenerationConfig {}

export interface Response2 {
  body: Body2;
  headers: Headers;
  id: string;
  messages: Message[];
  modelId: string;
  timestamp: string;
}

export interface Body2 {
  candidates: Candidate[];
  modelVersion: string;
  responseId: string;
  usageMetadata: UsageMetadata2;
}

export interface Candidate {
  content: Content3;
  finishReason: string;
  index: number;
}

export interface Content3 {
  parts: Part2[];
  role: string;
}

export interface Part2 {
  text: string;
}

export interface UsageMetadata2 {
  candidatesTokenCount: number;
  promptTokenCount: number;
  promptTokensDetails: PromptTokensDetail[];
  thoughtsTokenCount: number;
  totalTokenCount: number;
}

export interface PromptTokensDetail {
  modality: string;
  tokenCount: number;
}

export interface Headers {
  "alt-svc": string;
  "content-encoding": string;
  "content-type": string;
  date: string;
  server: string;
  "server-timing": string;
  "transfer-encoding": string;
  vary: string;
  "x-content-type-options": string;
  "x-frame-options": string;
  "x-xss-protection": string;
}

export interface Message {
  content: Content4[];
  role: string;
}

export interface Content4 {
  text: string;
  type: string;
}

export interface Usage {
  cachedInputTokens: number;
  inputTokenDetails: InputTokenDetails;
  inputTokens: number;
  outputTokenDetails: OutputTokenDetails;
  outputTokens: number;
  raw: Raw;
  reasoningTokens: number;
  totalTokens: number;
}

export interface InputTokenDetails {
  cacheReadTokens: number;
  noCacheTokens: number;
}

export interface OutputTokenDetails {
  reasoningTokens: number;
  textTokens: number;
}

export interface Raw {
  candidatesTokenCount: number;
  promptTokenCount: number;
  thoughtsTokenCount: number;
  totalTokenCount: number;
}

export interface TotalUsage {
  cachedInputTokens: number;
  inputTokenDetails: InputTokenDetails2;
  inputTokens: number;
  outputTokenDetails: OutputTokenDetails2;
  outputTokens: number;
  reasoningTokens: number;
  totalTokens: number;
}

export interface InputTokenDetails2 {
  cacheReadTokens: number;
  noCacheTokens: number;
}

export interface OutputTokenDetails2 {
  reasoningTokens: number;
  textTokens: number;
}
