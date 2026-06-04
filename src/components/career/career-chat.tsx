'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2, MessageSquare, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { createSSEParser } from '@/lib/stream-parser';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface CareerChatProps {
  reportId: string;
  initialMessages?: Message[];
  userName?: string;
}

const SUGGESTED_PROMPTS = [
  "Improve My Resume",
  "Suggest Skills",
  "Interview Questions",
  "Career Roadmap",
  "Salary Advice"
];

export function CareerChat({ reportId, initialMessages = [], userName }: CareerChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize or fetch session
  useEffect(() => {
    async function initSession() {
      try {
        const response = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId, title: `Chat about ${userName || 'Career'}` }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessionId(data.id);
        }
      } catch (error) {
        console.error('Failed to init chat session:', error);
      }
    }

    if (!sessionId) {
      initSession();
    }
  }, [reportId, sessionId, userName]);

  // Auto-scroll to bottom with smoother behavior
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use requestAnimationFrame for smoother scrolling during active streaming
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: messages.length <= 1 ? 'smooth' : 'auto'
          });
        });
      }
    }
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    if (!content.trim() || !sessionId || isLoading) return;

    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: content }),
      });

      if (!response.ok) throw new Error('Failed to connect to AI mentor');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream available');

      let assistantContent = '';
      
      // Add empty assistant message that we'll fill
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const parser = createSSEParser({
        onContent: (delta) => {
          // Deduplicate: only append if this delta isn't already at the end of assistantContent
          if (delta && !assistantContent.endsWith(delta)) {
            assistantContent += delta;
            
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1].content = assistantContent;
              }
              return newMessages;
            });
          }
        },
        onDone: () => {
          setIsLoading(false);
        },
        onError: (err) => {
          console.error('[career-chat] Stream error:', err);
        }
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          parser.flush();
          break;
        }
        parser.processChunk(value);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || 'Connection lost. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove failed message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[600px] shadow-xl border-teal-100 overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Career Mentor
          </CardTitle>
          <div className="flex items-center gap-2 text-xs bg-teal-500/50 px-2 py-1 rounded-full">
            <span className="h-2 w-2 bg-emerald-300 rounded-full animate-pulse" />
            Online
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden relative">
        <ScrollArea ref={scrollRef} className="h-full p-4">
          <div className="space-y-6 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-10 space-y-4">
                <div className="bg-teal-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-teal-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800">Your Career Mentor is Ready</h3>
                  <p className="text-sm text-gray-500 max-w-[250px] mx-auto">
                    Ask me about your roadmap, skill gaps, or how to improve your resume.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2",
                  msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className={cn(
                  "h-8 w-8 mt-1 shrink-0",
                  msg.role === 'user' ? "bg-teal-100 text-teal-700" : "bg-teal-600 text-white"
                )}>
                  <AvatarFallback>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                
                <div className={cn(
                  "max-w-[80%] rounded-2xl p-4 shadow-sm",
                  msg.role === 'user' 
                    ? "bg-teal-600 text-white rounded-tr-none" 
                    : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200"
                )}>
                  <div className="prose prose-sm prose-teal max-w-none dark:prose-invert">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className={cn(
                    "text-[10px] mt-2 opacity-70",
                    msg.role === 'user' ? "text-right" : "text-left"
                  )}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-teal-600 text-white shrink-0">
                  <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 border border-gray-200 shadow-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-gray-50 flex flex-col gap-3">
        {messages.length < 3 && (
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className="text-xs rounded-full border-teal-200 hover:bg-teal-50 hover:text-teal-700 h-7 whitespace-nowrap"
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}
        
        <form
          className="flex items-center gap-2 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your career mentor..."
            className="flex-1 bg-white border-teal-200 focus-visible:ring-teal-500 rounded-xl"
            disabled={isLoading || !sessionId}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="bg-teal-600 hover:bg-teal-700 rounded-xl shrink-0"
            disabled={isLoading || !input.trim() || !sessionId}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
