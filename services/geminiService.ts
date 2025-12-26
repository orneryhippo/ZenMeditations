
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { MeditationVoice, ImageSize } from "../types";

// Helper to decode base64 audio
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode PCM to AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiService {
  private static getAi() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateScript(prompt: string): Promise<string> {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, soothing meditation script (about 100-150 words) based on this theme: "${prompt}". Focus on breathing and mindfulness.`,
      config: {
        systemInstruction: "You are a professional meditation guide known for a calm, soothing presence.",
      }
    });
    return response.text || "Breathe in deeply, and breathe out slowly. Find peace in this moment.";
  }

  static async generateVisual(prompt: string, size: ImageSize): Promise<string> {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A serene, cinematic, minimalist meditation landscape, soft lighting, ${prompt}. High quality, peaceful, ethereal.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: size
        }
      }
    });

    let imageUrl = '';
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    return imageUrl;
  }

  static async generateAudio(script: string, voice: MeditationVoice): Promise<string> {
    const ai = this.getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say in a calm, meditative pace: ${script}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Failed to generate audio content");
    return base64Audio;
  }

  static createChatSession() {
    const ai = this.getAi();
    return ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are ZenGen Assistant, an expert in mindfulness, meditation, and stress management. Provide helpful, peaceful, and scientifically grounded advice on meditation techniques.",
      },
    });
  }
}
