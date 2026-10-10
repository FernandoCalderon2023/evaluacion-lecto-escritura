import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  timeout: 90_000,
  maxRetries: 1,
  apiKey: process.env.ANTHROPIC_API_KEY,
})
