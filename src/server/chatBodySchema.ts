import { z } from 'zod';

const PartSchema = z.union([
  z.object({ type: z.literal('text'), text: z.string().max(64_000) }),
  z.object({
    type: z.literal('image'),
    dataUrl: z.string().startsWith('data:image/').max(15_000_000),
    mimeType: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
  z.object({
    type: z.literal('tool-call'),
    toolCallId: z.string(),
    toolName: z.string(),
    input: z.unknown(),
  }),
  z.object({
    type: z.literal('tool-result'),
    toolCallId: z.string(),
    toolName: z.string(),
    output: z.unknown(),
    isError: z.boolean().optional(),
  }),
  // Passthrough for AI SDK parts (step-start, reasoning, source, tool-invocation, etc.)
  z.object({ type: z.string() }).passthrough(),
]);

const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  parts: z.array(PartSchema).min(1).max(20),
});

export const ChatBodySchema = z.object({
  model: z.string().min(1).max(200),
  messages: z.array(MessageSchema).min(1).max(200),
  toolConfig: z.object({
    webSearch: z.boolean(),
    webSearchParams: z.object({
      engine: z.enum(['auto', 'native', 'exa', 'firecrawl', 'parallel']).optional(),
      max_results: z.number().int().min(1).max(25).optional(),
      search_context_size: z.enum(['low', 'medium', 'high']).optional(),
      allowed_domains: z.array(z.string()).optional(),
      excluded_domains: z.array(z.string()).optional(),
    }).optional(),
    urlFetch: z.boolean(),
  }),
});

export type ChatBody = z.infer<typeof ChatBodySchema>;
