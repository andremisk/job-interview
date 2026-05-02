"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Mic, Square, RotateCcw, Send } from "lucide-react";

interface AudioAnswerInputProps {
  sessionId: string;
  questionId: string;
  userId: string;
  onSubmit: (transcription: string, storagePath: string, answerId: string) => void;
  disabled: boolean;
}

export function AudioAnswerInput({
  sessionId,
  questionId,
  userId,
  onSubmit,
  disabled,
}: AudioAnswerInputProps) {
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { isRecording, blob, duration, stream, error, startRecording, stopRecording, reset } =
    useMediaRecorder({ mode: "audio" });

  // Waveform visualization
  useEffect(() => {
    if (!isRecording || !stream) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const cCtx = canvas.getContext("2d")!;
    const data = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      analyser.getByteTimeDomainData(data);
      cCtx.clearRect(0, 0, canvas!.width, canvas!.height);
      cCtx.strokeStyle = "hsl(240, 5.9%, 10%)";
      cCtx.lineWidth = 1.5;
      cCtx.beginPath();
      const sliceWidth = canvas!.width / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas!.height) / 2;
        if (i === 0) cCtx.moveTo(x, y);
        else cCtx.lineTo(x, y);
        x += sliceWidth;
      }
      cCtx.stroke();
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ctx.close();
    };
  }, [isRecording, stream]);

  function formatDuration(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  async function handleSubmit() {
    if (!blob) return;
    setUploading(true);
    setUploadError(null);

    const path = `${userId}/${sessionId}/${questionId}.webm`;

    // Upload to Supabase Storage
    const { error: uploadErr } = await supabase.storage
      .from("interview-recordings")
      .upload(path, blob, { upsert: true, contentType: "audio/webm" });

    if (uploadErr) {
      setUploadError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    // Insert answer row first (transcribe route needs the ID)
    const { data: answer, error: insertErr } = await supabase
      .from("answers")
      .insert({
        question_id: questionId,
        session_id: sessionId,
        answer_type: "audio",
        storage_path: path,
      })
      .select()
      .single();

    if (insertErr || !answer) {
      setUploadError("Failed to save answer.");
      setUploading(false);
      return;
    }

    // Transcribe
    const formData = new FormData();
    formData.append("file", blob, "recording.webm");
    formData.append("answerId", answer.id);

    const res = await fetch("/api/transcribe", { method: "POST", body: formData });
    const { transcription, error: transcribeErr } = await res.json();

    if (transcribeErr || !transcription) {
      setUploadError("Transcription failed.");
      setUploading(false);
      return;
    }

    setUploading(false);
    onSubmit(transcription, path, answer.id);
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-4">{error}</p>
    );
  }

  return (
    <div className="space-y-4">
      {isRecording && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <canvas ref={canvasRef} width={400} height={48} className="w-full h-12" />
        </div>
      )}

      {blob && !isRecording && (
        <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
          <audio controls src={URL.createObjectURL(blob)} className="flex-1 h-8" />
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isRecording && !blob && (
          <Button onClick={startRecording} disabled={disabled} variant="outline">
            <Mic className="h-4 w-4" />
            Start recording
          </Button>
        )}

        {isRecording && (
          <>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm">{formatDuration(duration)}</span>
            </div>
            <Button onClick={stopRecording} variant="outline" size="sm">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}

        {blob && !isRecording && (
          <>
            <Button variant="ghost" size="sm" onClick={reset} disabled={uploading || disabled}>
              <RotateCcw className="h-4 w-4" />
              Re-record
            </Button>
            <Button onClick={handleSubmit} disabled={uploading || disabled}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit answer
            </Button>
          </>
        )}
      </div>

      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
    </div>
  );
}
