'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/providers/auth-provider';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const FloatingChat: React.FC = () => {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user?.id) return;

    try {
      setIsLoading(true);
      const userMessage = input.trim();
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
      setInput('');

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        // Create new session via API
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title: 'New Chat' })
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(`Failed to create session: ${errorData.error}`);
        }
        const data = await res.json();
        currentSessionId = data.id;
        setSessionId(currentSessionId);
      }

      // Send message to chat API
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: currentSessionId, message: userMessage })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Chat request failed');
      }

      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullAssistantMessage = '';
      const assistantMessageId = Date.now().toString();
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            const dataStr = line.trim().slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                fullAssistantMessage += data.content;
                setMessages(prev => prev.map(m => m.id === assistantMessageId ? { ...m, content: fullAssistantMessage } : m));
              }
            } catch (e) { /* ignore invalid JSON */ }
          }
        }
      }

    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: `Sorry, there was an error: ${e instanceof Error ? e.message : 'Please try again later.'}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <Card className={`
          shadow-2xl border-teal-100 
          ${isExpanded ? 'w-[600px] h-[600px]' : 'w-[400px] h-[500px]'} 
          transition-all duration-300 ease-out
        `}>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              AI Career Copilot
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex flex-col h-[calc(100%-80px)]">
            <ScrollArea ref={scrollRef} className="flex-1 mb-4 pr-2">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>👋 Hi there! I'm your AI Career Copilot. How can I help you today?</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`
                        max-w-[80%] px-4 py-2 rounded-2xl shadow-sm
                        ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}
                      `}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-tl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <p>Thinking...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Ask me anything about your career..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !input.trim()} 
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-xl bg-teal-600 hover:bg-teal-700 flex items-center justify-center"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
      </Button>
    </div>
  );
};
