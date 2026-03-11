export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "anthropic/claude-opus-4.5": { input: 15 / 1_000_000, output: 75 / 1_000_000 },
  "anthropic/claude-sonnet-4": { input: 3 / 1_000_000, output: 15 / 1_000_000 },
  "openai-codex/gpt-5.2": { input: 5 / 1_000_000, output: 15 / 1_000_000 },
  "openai/gpt-4o": { input: 5 / 1_000_000, output: 15 / 1_000_000 },
  "ollama/local": { input: 0, output: 0 },
  unknown: { input: 2 / 1_000_000, output: 8 / 1_000_000 },
};

export function estimateCost(model: string, inputTokens: number, outputTokens: number) {
  const pricing = MODEL_PRICING[model] ?? MODEL_PRICING.unknown;
  return inputTokens * pricing.input + outputTokens * pricing.output;
}
