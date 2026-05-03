import { SaveKeyError } from '@/stores/chat';

export function keyErrorMessage(e: unknown): string {
  if (e instanceof SaveKeyError) {
    switch (e.code) {
      case 'invalid_key':
        return 'OpenRouter rejected this key. Double-check it and try again.';
      case 'openrouter_unreachable':
        return "Couldn't reach OpenRouter. Check your network and try again.";
      case 'network':
        return "Couldn't reach the StashChat server. Try again in a moment.";
      case 'bad_request':
        return "That doesn't look like an OpenRouter key.";
      default:
        return 'Something went wrong. Please try again.';
    }
  }
  return 'Something went wrong. Please try again.';
}
