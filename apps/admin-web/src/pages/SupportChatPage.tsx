import { useState, useRef, useEffect } from 'react';
import { useApiQuery, useApiMutation } from '@/hooks';
import { supportChatService, ChatMessage } from '@/services/support-chat.service';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Send, User as UserIcon, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function SupportChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, refetch } = useApiQuery(['chat', 'messages'], () =>
    supportChatService.getMessages(1, 50),
    { refetchInterval: 5000 }
  );

  const sendMutation = useApiMutation(
    (content: string) => supportChatService.sendMessage(content),
    {
      onSuccess: () => {
        setMessage('');
        refetch();
      },
    }
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data]);

  const messages = [...(data?.data || [])].reverse();

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Support Chat</h1>
        <p className="text-muted-foreground mt-1">Direct communication with administration</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b py-4 bg-primary/5">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Support Channel
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <MessageCircle className="h-12 w-12 mb-2" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isOwn = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full gap-3",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwn && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <UserIcon className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "flex flex-col max-w-[70%]",
                      isOwn ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                        isOwn 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted text-foreground rounded-tl-none"
                      )}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form 
            onSubmit={handleSend}
            className="p-4 border-t bg-background/50 flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background border-muted-foreground/20 focus-visible:ring-primary"
              disabled={sendMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!message.trim() || sendMutation.isPending}
              className="rounded-full shrink-0"
            >
              {sendMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
