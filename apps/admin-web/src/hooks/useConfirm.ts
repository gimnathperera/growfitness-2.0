import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm() {
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    open: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({
        open: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true);
    }
    setConfirmState({ open: false, options: null, resolve: null });
  }, [confirmState]);

  const handleCancel = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false);
    }
    setConfirmState({ open: false, options: null, resolve: null });
  }, [confirmState]);

  return {
    confirm,
    confirmState: {
      open: confirmState.open,
      options: confirmState.options,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
