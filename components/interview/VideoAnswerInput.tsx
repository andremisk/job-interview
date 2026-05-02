"use client";

import { useEffect, useRef, useState } from "react";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Square, RotateCcw, Send } from "lucide-react";

interface VideoAnswerInputProps {
  sessionId: string;
  questionId: string;
  userId: string;
  onSubmit: (transcription: string, storagePath: string, answerId: string) => void;
  disabled: boolean;
}

export function VideoAnswerInput({
  sessionId,
  questionId,
  userId,
  onSubmit,
  disabled,
}: VideoAnswerInputProps) {
  const supabase = createClient();
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { isRecording, blob, duration, stream, error, startRecording, stopRecording, reset } =
    useMediaRecorder({ mode: "video" });

  useEffect(() => {
    if (previewRef.current && stream) {
      previewRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (playbackRef.current && blob) {
      playbackRef.current.src = URL.createObjectURL(blob);
    }
  }, [blob]);

  function formatDuration(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  async function handleSubmit() {
    if (!blob) return;
    setUploading(true);
    setUploadError(null);

    const path = `${userId}/${sessionId}/${questionId}-video.webm`;

    const { error: uploadErr } = await supabase.storage
      .from("interview-recordings")
      .upload(path, blob, { upsert: true, contentType: "video/webm" });

    if (uploadErr) {
      setUploadError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }

    const { data: answer, error: insertErr } = await supabase
      .from("answers")
      .insert({
        question_id: questionId,
        session_id: sessionId,
        answer_type: "video",
        storage_path: path,
      })
      .select()
      .single();

    if (insertErr || !answer) {
      setUploadError("Failed to save answer.");
      setUploading(false);
      return;
    }

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
    return <p className="text-sm text-destructive py-4">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {isRecording && (
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
          <video ref={previewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-mono">{formatDuration(duration)}</span>
          </div>
        </div>
      )}

      {blob && !isRecording && (
        <div className="rounded-lg overflow-hidden bg-black aspect-video">
          <video ref={playbackRef} controls playsInline className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isRecording && !blob && (
          <Button onClick={startRecording} disabled={disabled} variant="outline">
            <Video className="h-4 w-4" />
            Start recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="outline" size="sm">
            <Square className="h-4 w-4" />
            Stop recording
          </Button>
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
