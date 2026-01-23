import { useToast as useShadcnToast } from '@/hooks/use-toast';

export function useToast() {
  const { toast } = useShadcnToast();

  return {
    toast: {
      success: (title: string, description?: string) => {
        toast({
          title,
          description,
          variant: 'default',
        });
      },
      error: (title: string, description?: string) => {
        toast({
          title,
          description,
          variant: 'destructive',
        });
      },
      info: (title: string, description?: string) => {
        toast({
          title,
          description,
        });
      },
    },
  };
}
