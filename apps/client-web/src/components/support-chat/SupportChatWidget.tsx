import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { useChatSounds } from './useChatSounds';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
};

const BRAND = '#49AE6E';
const FALLBACK_MESSAGE = 'Something went wrong. Please try again or contact support.';

const QUICK_REPLIES = ['How do I book a session?', 'How do I reschedule?', 'Contact support'];

function getTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

const BotAvatar = ({ size = 32 }: { size?: number }) => (
  <div
    style={{ width: size, height: size, background: BRAND, flexShrink: 0 }}
    className="rounded-full flex items-center justify-center"
  >
    <Bot className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2} />
  </div>
);

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { playSound } = useChatSounds();

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const toggleOpen = () => {
    if (!open) playSound('open');
    setOpen(o => !o);
  };

  const send = async (text?: string) => {
    const content = (text ?? input.trim()).trim();
    if (!content || loading) return;
    if (!text) setInput('');
    playSound('send');
    const userMsg: Message = { role: 'user', content, timestamp: getTime() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const result = await api.post<{ message: string }>('/support-chat/message', {
        messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: result.message, timestamp: getTime() },
      ]);
      playSound('receive');
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: FALLBACK_MESSAGE, timestamp: getTime() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showQuickReplies =
    messages.length === 0 || (messages[messages.length - 1].role === 'assistant' && !loading);

  // Group consecutive assistant messages to show avatar only on last in group
  const shouldShowAvatar = (i: number) => {
    if (messages[i].role !== 'assistant') return false;
    return i === messages.length - 1 || messages[i + 1].role !== 'assistant';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        .scw-panel {
          font-family: 'DM Sans', sans-serif;
          animation: scw-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes scw-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .scw-bubble-btn {
          animation: scw-pulse 2.5s ease-in-out infinite;
        }
        @keyframes scw-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(73,174,110,0.5); }
          50%      { box-shadow: 0 0 0 10px rgba(73,174,110,0); }
        }
        .scw-msg-in {
          animation: scw-msg 0.18s ease-out;
        }
        @keyframes scw-msg {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .scw-scrollbar::-webkit-scrollbar { width: 4px; }
        .scw-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .scw-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 4px; }
      `}</style>

      {open && (
        <div
          className="scw-panel fixed bottom-20 right-4 z-50 flex flex-col bg-white rounded-2xl overflow-hidden"
          style={{
            width: 'min(390px, calc(100vw - 2rem))',
            maxHeight: 'min(640px, calc(100vh - 6rem))',
            boxShadow: '0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
          }}
          aria-label="Support chat"
        >
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <BotAvatar size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-[15px] leading-tight">Chat with us!</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full" style={{ background: BRAND }} />
                <span className="text-xs text-gray-500 font-medium">We're online!</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" aria-label="Close chat" size="icon" onClick={toggleOpen}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto scw-scrollbar bg-white px-4 py-4 flex flex-col gap-1"
            style={{ minHeight: 200 }}
          >
            {/* Date stamp */}
            <div className="flex items-center gap-2 my-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium px-1">
                {formatDate(new Date())}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {messages.length === 0 && (
              <div className="scw-msg-in">
                {/* Greeting bubble */}
                <p className="text-xs text-gray-400 font-medium mb-1 ml-1">Grow Fitness Support</p>
                <div className="flex gap-2 items-end mb-3">
                  <div
                    className="rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-800 leading-relaxed max-w-[82%]"
                    style={{ background: '#f3f4f6' }}
                  >
                    Hi! 👋 I'm your Grow Fitness assistant. Ask me anything about sessions,
                    rescheduling, or payments!
                  </div>
                  <BotAvatar size={28} />
                </div>
                {/* Quick replies */}
                <div className="flex flex-wrap gap-2 mt-1">
                  {QUICK_REPLIES.map(label => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => send(label)}
                      className="rounded-full border-2 text-sm font-medium px-4 py-1.5 transition-all hover:text-white"
                      style={{
                        borderColor: BRAND,
                        color: BRAND,
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = BRAND;
                        (e.currentTarget as HTMLButtonElement).style.color = 'white';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'white';
                        (e.currentTarget as HTMLButtonElement).style.color = BRAND;
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.role === 'user';
              const showAvatar = shouldShowAvatar(i);
              const showLabel = !isUser && (i === 0 || messages[i - 1].role !== 'assistant');

              return (
                <div
                  key={i}
                  className={cn('scw-msg-in flex flex-col', isUser ? 'items-end' : 'items-start')}
                >
                  {!isUser && showLabel && (
                    <p className="text-xs text-gray-400 font-medium ml-9 mb-1">
                      Grow Fitness Support
                    </p>
                  )}
                  <div className={cn('flex items-end gap-2', isUser && 'flex-row-reverse')}>
                    {/* Avatar placeholder for spacing in assistant group */}
                    {!isUser && (
                      <div style={{ width: 28, flexShrink: 0 }}>
                        {showAvatar && <BotAvatar size={28} />}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                        isUser && 'w-max'
                      )}
                      style={
                        isUser
                          ? { background: BRAND, color: 'white', borderBottomRightRadius: 6 }
                          : { background: '#f3f4f6', color: '#111827', borderBottomLeftRadius: 6 }
                      }
                    >
                      {m.content}
                    </div>
                    {m.timestamp && (
                      <p className="text-[11px] text-gray-400 mb-0.5 shrink-0">
                        {m.timestamp}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="scw-msg-in flex items-end gap-2">
                <div style={{ width: 28 }}>
                  <BotAvatar size={28} />
                </div>
                <div
                  className="rounded-2xl px-4 py-3 text-sm"
                  style={{ background: '#f3f4f6', borderBottomLeftRadius: 6 }}
                >
                  <span className="flex gap-1 items-center">
                    {[0, 1, 2].map(d => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 rounded-full bg-gray-400 inline-block"
                        style={{
                          animation: `scw-dot 1.2s ease-in-out ${d * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                  <style>{`
                    @keyframes scw-dot {
                      0%,80%,100%{transform:translateY(0)}
                      40%{transform:translateY(-5px)}
                    }
                  `}</style>
                </div>
              </div>
            )}

            {/* Quick replies after last assistant message */}
            {showQuickReplies && messages.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 mt-2 ml-9">
                {QUICK_REPLIES.map(label => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => send(label)}
                    className="rounded-full border-2 text-sm font-medium px-4 py-1.5 bg-white transition-all"
                    style={{ borderColor: BRAND, color: BRAND }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = BRAND;
                      (e.currentTarget as HTMLButtonElement).style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'white';
                      (e.currentTarget as HTMLButtonElement).style.color = BRAND;
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Input ── */}
          <div className="border-t border-gray-100 bg-white px-3 pt-3 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 rounded-xl border-gray-200 text-sm focus-visible:ring-1 bg-gray-50"
                style={{ '--tw-ring-color': BRAND } as React.CSSProperties}
              />
              <Button
                variant="default"
                size="icon"
                aria-label="Send message"
                onClick={() => send()}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-2 pb-0.5">
              Powered by{' '}
              <span className="font-semibold" style={{ color: BRAND }}>
                Grow Fitness
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ── FAB Toggle ── */}
      <button
        type="button"
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        onClick={toggleOpen}
        className={cn(
          'fixed bottom-4 right-4 z-[60] h-14 w-14 flex items-center justify-center rounded-full text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'shadow-lg hover:shadow-xl hover:scale-110 active:scale-95',
          !open && 'scw-bubble-btn'
        )}
        style={
          {
            background: BRAND,
            '--tw-ring-color': BRAND,
          } as React.CSSProperties
        }
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
