import { http, HttpResponse } from 'msw';

export const defaultHandlers = [
  http.get('https://openrouter.ai/api/v1/key', ({ request }) => {
    const auth = request.headers.get('authorization') ?? '';
    if (auth === 'Bearer sk-or-v1-valid') {
      return HttpResponse.json({ data: { label: 'test' } });
    }
    return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
  }),
  http.get('https://openrouter.ai/api/v1/models', () => {
    return HttpResponse.json({
      data: [
        {
          id: 'openrouter/free',
          name: 'OpenRouter Free',
          context_length: 8192,
          architecture: { input_modalities: ['text'] },
          supported_parameters: ['messages'],
        },
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          context_length: 128_000,
          architecture: { input_modalities: ['text', 'image'] },
          supported_parameters: ['messages', 'tools', 'temperature'],
        },
      ],
    });
  }),
];
