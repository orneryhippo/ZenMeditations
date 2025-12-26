
export enum MeditationVoice {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export enum ImageSize {
  OneK = '1K',
  TwoK = '2K',
  FourK = '4K'
}

export interface MeditationSession {
  id: string;
  title: string;
  prompt: string;
  imageUrl: string;
  audioData: string; // Base64 PCM data
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
