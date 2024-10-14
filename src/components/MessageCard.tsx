import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

interface MessageCardProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  onEdit?: (newContent: string) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ role, content, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && contentEditableRef.current) {
      contentEditableRef.current.focus();
      const range = document.createRange();
      range.selectNodeContents(contentEditableRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  const handleClick = () => {
    if (role === 'system' && onEdit) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (onEdit && editedContent !== content) {
      onEdit(editedContent);
    }
  };

  const handleInput = () => {
    if (contentEditableRef.current) {
      setEditedContent(contentEditableRef.current.innerText);
    }
  };

  return (
    <div className="border-gray-200 dark:border-zinc-700">
      <div className={cn(
        "px-4 py-2 text-sm font-light uppercase tracking-wide",
        role === 'user' ? "text-blue-500" :
        role === 'assistant' ? "text-green-500" :
        "text-gray-500"
      )}>
        {role}
      </div>
      <div 
        ref={contentEditableRef}
        className={cn("p-4", role === 'system' && "cursor-pointer")}
        contentEditable={isEditing}
        onBlur={handleBlur}
        onInput={handleInput}
        onClick={handleClick}
        suppressContentEditableWarning={true}
      >
        {content}
      </div>
    </div>
  );
};

export default MessageCard;
