"use client";

import { useState, useRef, useCallback } from "react";

interface UseMediaRecorderOptions {
  mode: "audio" | "video";
}

export function useMediaRecorder({ mode }: UseMediaRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setBlob(null);
    setDuration(0);

    try {
      const constraints: MediaStreamConstraints =
        mode === "video"
          ? { audio: true, video: true }
          : { audio: true };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      const recorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: recorder.mimeType });
        setBlob(recorded);
        mediaStream.getTracks().forEach((t) => t.stop());
        setStream(null);
      };

      recorder.start(250);
      recorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      setError("Could not access microphone. Check browser permissions.");
    }
  }, [mode]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const reset = useCallback(() => {
    setBlob(null);
    setDuration(0);
    setError(null);
  }, []);

  return { isRecording, blob, duration, stream, error, startRecording, stopRecording, reset };
}
