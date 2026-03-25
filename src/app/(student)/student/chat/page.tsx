'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { subscribeMessages, sendMessage } from '@/lib/firestore';
import { format } from 'date-fns';
import { Send, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/types';

export default function StudentChatPage() {
  const { phone } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!phone) return;
    const unsub = subscribeMessages(phone, setMessages);
    return unsub;
  }, [phone]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const msg = { senderId: phone, text: text.trim(), timestamp: Date.now(), read: false };
    setText('');
    await sendMessage(phone, msg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <MessageSquare size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Admin</p>
          <p className="text-xs text-slate-400">SAVAN CLASSES</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
              Chat with your admin here. Ask doubts, get updates!
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === phone;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-primary text-slate-900' : 'bg-surface-2 text-white'}`}>
                  {!isMe && <p className="text-[10px] text-primary font-medium mb-0.5">Admin</p>}
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-slate-700' : 'text-slate-400'}`}>
                    {format(new Date(msg.timestamp), 'hh:mm a')}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-4 border-t border-slate-700/50 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-slate-700 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
          />
          <Button onClick={handleSend} disabled={!text.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
