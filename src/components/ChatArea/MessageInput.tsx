import { useState, useRef, DragEvent, useEffect } from 'react';
import {
  useMessagesStore,
  useConversationsStore,
  useUsersStore,
  useSessionStore,
  makeRequest,
} from '../../store';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  DocumentIcon,
  FilmIcon,
} from '@heroicons/react/24/outline';

interface Props {
  conversationId: string;
  parentMessageId?: string;
  isThread?: boolean;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
}

const MessageInput = ({
  conversationId,
  parentMessageId,
  isThread = false,
}: Props) => {
  const { create, aiMessages } = useMessagesStore();
  const { currentConversation } = useConversationsStore();
  const { users } = useUsersStore();
  const { session } = useSessionStore();
  const [content, setContent] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const typingSpeedRef = useRef<number>(50); // ms per character

  const getPlaceholder = () => {
    if (isThread) {
      return 'Reply...';
    }

    if (!currentConversation || !session) return 'Type a message...';

    if (currentConversation.is_channel) {
      return `Message #${currentConversation.name}`;
    }

    const otherUser = users.find((u) =>
      currentConversation.conversation_members.some(
        (m) => m.user_id === u.id && m.user_id !== session.id
      )
    );

    return `Message ${otherUser?.username}`;
  };

  const handleDragOver = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const isVideoFile = (file: File) => {
    return file.type.startsWith('video/');
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || '';
  };

  const addFiles = (newFiles: File[]) => {
    const previews = newFiles.map((file) => {
      const preview: FilePreview = { file };

      if (isImageFile(file) || isVideoFile(file)) {
        preview.previewUrl = URL.createObjectURL(file);
      }

      return preview;
    });

    setFilePreviews((prev) => [...prev, ...previews]);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    const preview = filePreviews[index];
    if (preview.previewUrl) {
      URL.revokeObjectURL(preview.previewUrl);
    }
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: DragEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const uploadToS3 = async (file: File) => {
    // First, get a pre-signed URL from your server
    const response = await makeRequest(
      import.meta.env.VITE_SERVER_API_HOST + '/api/get-upload-url',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      }
    );

    const { uploadUrl, fileUrl, s3Key } = await response.json();
    // Upload directly to S3 using the pre-signed URL
    await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    return {
      url: fileUrl,
      type: file.type,
      name: file.name,
      size: file.size,
      s3Key,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && files.length === 0) || isUploading) return;

    try {
      setIsUploading(true);

      let attachments = [];
      if (files.length > 0) {
        attachments = await Promise.all(files.map(uploadToS3));
      }

      await create({ conversationId, content, parentMessageId, attachments });

      setContent('');
      setFiles([]);
      // Clear file previews and revoke object URLs
      filePreviews.forEach((preview) => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
      setFilePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const currentAIMessage = aiMessages.find(
      (msg) =>
        msg.conversation_id === conversationId &&
        ((!msg.parent_message_id && !parentMessageId) ||
          msg.parent_message_id === parentMessageId)
    );

    if (currentAIMessage?.content && !isTyping) {
      setIsTyping(true);
      setContent('');
      setTypingIndex(0);
    }
  }, [aiMessages, conversationId, parentMessageId]);

  useEffect(() => {
    if (!isTyping) return;

    const currentAIMessage = aiMessages.find(
      (msg) =>
        msg.conversation_id === conversationId &&
        ((!msg.parent_message_id && !parentMessageId) ||
          msg.parent_message_id === parentMessageId)
    );

    if (!currentAIMessage?.content) return;

    if (typingIndex < currentAIMessage.content.length) {
      const timeoutId = setTimeout(() => {
        setContent((prev) => prev + currentAIMessage.content[typingIndex]);
        setTypingIndex((prev) => prev + 1);

        // Vary the typing speed slightly for more natural feel
        typingSpeedRef.current = Math.random() * 10 + 15; // 15-25ms
      }, typingSpeedRef.current);

      return () => clearTimeout(timeoutId);
    } else {
      setIsTyping(false);
      // Auto submit after typing is complete
      handleSubmit(new Event('submit') as any);
    }
  }, [typingIndex, isTyping, aiMessages, conversationId, parentMessageId]);

  // Clean up previews on unmount
  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => {
        if (preview.previewUrl) {
          URL.revokeObjectURL(preview.previewUrl);
        }
      });
    };
  }, []);

  return (
    <div className="p-4 border-t border-base-300">
      {filePreviews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filePreviews.map((preview, index) => (
            <div key={index} className="relative group">
              {isImageFile(preview.file) ? (
                <div className="relative w-16 h-16 overflow-hidden border rounded-lg border-base-300 group/preview">
                  <img
                    src={preview.previewUrl}
                    alt={preview.file.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 transition-colors duration-200 bg-black/0 group-hover/preview:bg-black/40" />
                </div>
              ) : isVideoFile(preview.file) ? (
                <div className="relative w-16 h-16 overflow-hidden border rounded-lg border-base-300 group/preview">
                  <video
                    src={preview.previewUrl}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center transition-colors duration-200 bg-black/30 group-hover/preview:bg-black/50">
                    <FilmIcon className="w-8 h-8 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-48 h-16 p-3 border rounded-lg border-base-300 bg-base-200 group/preview">
                  <div className="flex items-center h-full gap-3">
                    <DocumentIcon className="w-7 h-7 shrink-0 text-base-content/60" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">
                        {preview.file.name}
                      </div>
                      <div className="text-xs text-base-content/60">
                        {getFileExtension(preview.file.name)}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 transition-colors duration-200 rounded-lg bg-black/0 group-hover/preview:bg-black/5" />
                </div>
              )}

              <button
                onClick={() => removeFile(index)}
                className="absolute z-10 flex items-center justify-center w-5 h-5 transition-opacity rounded-full opacity-0 -top-2 -right-2 bg-base-300 text-base-content/60 hover:text-base-content group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex items-start gap-2 ${
          isDragging ? 'bg-primary/5 rounded-lg' : ''
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-md text-base-content/60 hover:text-primary hover:bg-base-200"
          disabled={isTyping}
        >
          <PaperClipIcon className="w-5 h-5" />
        </button>
        <textarea
          value={content}
          onChange={(e) => !isTyping && setContent(e.target.value)}
          placeholder={isTyping ? 'AI is typing...' : getPlaceholder()}
          className="flex-1 min-h-[48px] max-h-32 py-3 px-4 textarea textarea-bordered resize-none overflow-auto text-[15px]"
          disabled={isUploading || isTyping}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          rows={2}
        />
        <button
          type="submit"
          disabled={
            (!content.trim() && files.length === 0) || isUploading || isTyping
          }
          className="h-12 px-4 transition-colors duration-200 rounded-md bg-primary/10 hover:bg-primary/20 disabled:bg-base-200 disabled:hover:bg-base-200"
        >
          <PaperAirplaneIcon
            className="w-5 h-5 transition-colors duration-200 text-primary disabled:text-base-content/30"
            style={{ transform: 'rotate(-45deg)' }}
          />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
