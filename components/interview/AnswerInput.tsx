"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextAnswerInput } from "./TextAnswerInput";
import { AudioAnswerInput } from "./AudioAnswerInput";
import { VideoAnswerInput } from "./VideoAnswerInput";
import { Mic, Type, Video } from "lucide-react";

interface AnswerInputProps {
  sessionId: string;
  questionId: string;
  userId: string;
  disabled: boolean;
  onTextSubmit: (text: string) => void;
  onMediaSubmit: (transcription: string, storagePath: string, answerId: string) => void;
}

export function AnswerInput({
  sessionId,
  questionId,
  userId,
  disabled,
  onTextSubmit,
  onMediaSubmit,
}: AnswerInputProps) {
  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="text" disabled={disabled} className="gap-1.5">
          <Type className="h-3.5 w-3.5" />
          Text
        </TabsTrigger>
        <TabsTrigger value="audio" disabled={disabled} className="gap-1.5">
          <Mic className="h-3.5 w-3.5" />
          Audio
        </TabsTrigger>
        <TabsTrigger value="video" disabled={disabled} className="gap-1.5">
          <Video className="h-3.5 w-3.5" />
          Video
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text">
        <TextAnswerInput onSubmit={onTextSubmit} disabled={disabled} />
      </TabsContent>

      <TabsContent value="audio">
        <AudioAnswerInput
          sessionId={sessionId}
          questionId={questionId}
          userId={userId}
          onSubmit={onMediaSubmit}
          disabled={disabled}
        />
      </TabsContent>

      <TabsContent value="video">
        <VideoAnswerInput
          sessionId={sessionId}
          questionId={questionId}
          userId={userId}
          onSubmit={onMediaSubmit}
          disabled={disabled}
        />
      </TabsContent>
    </Tabs>
  );
}
