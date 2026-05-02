import OpenAI, { toFile } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(
  buffer: Buffer,
  filename: string = "recording.webm"
): Promise<string> {
  const file = await toFile(buffer, filename, { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "text",
  });

  return transcription as unknown as string;
}
