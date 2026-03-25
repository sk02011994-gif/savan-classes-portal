'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getStudents, subscribeMessages, sendMessage } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { User, ChatMessage } from '@/types';

export default function AdminChatPage() {
  const { phone: adminPhone } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getStudents().then(s => {
      setStudents(s);
      if (s.length > 0) setSelectedStudent(s[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    const unsub = subscribeMessages(selectedStudent.phone, setMessages);
    return unsub;
  }, [selectedStudent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedStudent) return;
    const msg = { senderId: adminPhone, text: text.trim(), timestamp: Date.now(), read: false };
    setText('');
    await sendMessage(selectedStudent.phone, msg);
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Student list */}
      <div className="w-56 flex-shrink-0 hidden md:block">
        <Card className="h-full p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Students</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-56px)]">
            {students.map(s => (
              <button
                key={s.phone}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${selectedStudent?.phone === s.phone ? 'bg-primary/10 text-primary' : 'text-slate-300 hover:bg-slate-700/30'}`}
              >
                <p className="font-medium">{s.name || s.phone}</p>
                <p className="text-xs text-slate-500">{s.phone}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedStudent ? (
          <Card className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                {selectedStudent.name?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{selectedStudent.name || selectedStudent.phone}</p>
                <p className="text-xs text-slate-400">{selectedStudent.phone}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">No messages yet. Start the conversation!</div>
              )}
              {messages.map(msg => {
                const isAdmin = msg.senderId === adminPhone;
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? 'bg-primary text-slate-900' : 'bg-surface-2 text-white'}`}>
                      <p>{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isAdmin ? 'text-slate-700' : 'text-slate-400'}`}>
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
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a student to chat</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
