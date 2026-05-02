"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";

interface TextAnswerInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
}

export function TextAnswerInput({ onSubmit, disabled }: TextAnswerInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    onSubmit(text.trim());
    setText("");
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Type your answer here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        rows={6}
        className="resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) handleSubmit();
        }}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.length > 0 ? `${text.length} characters` : "⌘+Enter to submit"}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          size="sm"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit answer
        </Button>
      </div>
    </div>
  );
}
