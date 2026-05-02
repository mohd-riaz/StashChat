export interface ModelInfo {
  id: string;
  name: string;
  contextLength: number;
  inputModalities: ('text' | 'image' | 'audio' | 'file')[];
  supportsTools: boolean;
  pricing?: { prompt: string; completion: string };
}
