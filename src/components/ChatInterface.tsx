
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatInterfaceProps {
  context?: string; // Context from the report
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ context }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I've analyzed your medical report. I can explain the findings in simple terms. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const speakText = (text: string, messageId: string) => {
    // If this message is already speaking, stop it
    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Detect language from text
      const hindiPattern = /[\u0900-\u097F]/; // Devanagari script
      if (hindiPattern.test(text)) {
        utterance.lang = 'hi-IN'; // Hindi
      } else {
        utterance.lang = 'en-US'; // English (default)
      }

      // Set speaking state
      setSpeakingMessageId(messageId);

      // Clear speaking state when done
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Import the chatWithReport function
      const { chatWithReport } = await import('@/services/gemini');

      // Build chat history for context
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      // Get AI response
      const aiResponse = await chatWithReport(
        context || 'No report context available',
        newUserMessage.text,
        chatHistory
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsRecording(false);

        // Auto-send the message after speech recognition
        setTimeout(() => {
          const voiceMessage: Message = {
            id: Date.now().toString(),
            text: transcript,
            sender: 'user',
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, voiceMessage]);
          setInputValue('');
          setIsTyping(true);

          // Get AI response
          (async () => {
            try {
              const { chatWithReport } = await import('@/services/gemini');
              const chatHistory = messages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
              }));

              const aiResponse = await chatWithReport(
                context || 'No report context available',
                transcript,
                chatHistory
              );

              const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'bot',
                timestamp: new Date(),
              };

              setMessages((prev) => [...prev, botResponse]);
            } catch (error: any) {
              console.error('Chat error:', error);
              const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: error.message || 'Sorry, I encountered an error. Please try again.',
                sender: 'bot',
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, errorMessage]);
            } finally {
              setIsTyping(false);
            }
          })();
        }, 100);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [messages, context]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);


  return (
    <Card className="glass-card h-[600px] flex flex-col">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bot className="h-6 w-6 text-primary" />
          Medical Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
              >
                <Avatar className="h-8 w-8">
                  {message.sender === 'bot' ? (
                    <AvatarFallback className="bg-primary/10 text-primary"><Bot size={16} /></AvatarFallback>
                  ) : (
                    <AvatarFallback className="bg-secondary text-secondary-foreground"><User size={16} /></AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div
                    className={`rounded-lg p-3 text-sm ${message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                      }`}
                  >
                    {message.text}
                  </div>
                  {message.sender === 'bot' && (
                    <button
                      onClick={() => speakText(message.text, message.id)}
                      className="self-start flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {speakingMessageId === message.id ? (
                        <>
                          <VolumeX size={14} />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary"><Bot size={16} /></AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder={isRecording ? "Listening..." : "Ask about your report..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
              disabled={isRecording}
            />
            <Button
              type="button"
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              onClick={toggleVoiceRecording}
              disabled={isTyping}
              className={isRecording ? "animate-pulse" : ""}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping || isRecording}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};
