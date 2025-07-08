// frontend/components/ChatComponent.tsx
import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

interface ChatComponentProps {
  messages: Message[];
  onSend: (content: string) => void;
}

export default function ChatComponent({ messages, onSend }: ChatComponentProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">Chat</div>
      <div className="card-body p-0" style={{ height: '60vh', overflowY: 'auto' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 mb-2 rounded ${msg.senderEmail === localStorage.getItem('email') ? 'bg-info text-white ml-auto' : 'bg-light'}`}
            style={{ maxWidth: '70%', wordWrap: 'break-word' }}
          >
            <div>{msg.content}</div>
            <small className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="card-footer">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
          />
          <button className="btn btn-primary" onClick={handleSend}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}