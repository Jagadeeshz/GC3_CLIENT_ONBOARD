"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { uploadFileClient, getPublicUrlClient, BUCKETS } from "@/lib/database/storage";

interface ChatInputProps {
  onSendMessage: (content: string, file?: { url: string; name: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSend = () => {
    if ((!content.trim() && !attachedFile) || disabled) return;
    onSendMessage(content.trim(), attachedFile || undefined);
    setContent("");
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `chat/${Date.now()}_${file.name}`;
      const uploaded = await uploadFileClient(BUCKETS.ATTACHMENTS, path, file);
      if (uploaded) {
        const url = getPublicUrlClient(BUCKETS.ATTACHMENTS, uploaded);
        setAttachedFile({ url, name: file.name });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="border-t p-3 space-y-2">
      {attachedFile && (
        <div className="flex items-center gap-2 text-sm bg-muted rounded-md px-3 py-1.5">
          <Paperclip className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{attachedFile.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 shrink-0"
            onClick={() => setAttachedFile(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="relative">
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            disabled={disabled || uploading}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
          </Button>
        </div>
        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || uploading}
          className="flex-1"
        />
        <Button
          size="icon"
          className="h-9 w-9 shrink-0"
          disabled={disabled || (!content.trim() && !attachedFile)}
          onClick={handleSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
