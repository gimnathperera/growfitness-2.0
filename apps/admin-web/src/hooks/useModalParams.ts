import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export type ModalType = 'details' | 'edit' | 'create';

interface UseModalParamsReturn {
  /**
   * Current modal type from URL, or null if no modal is open
   */
  modal: ModalType | null;
  /**
   * Current entity ID from URL, or null if not present
   */
  entityId: string | null;
  /**
   * Whether the modal should be open based on URL params
   */
  isOpen: boolean;
  /**
   * Open a modal with the given ID and type
   */
  openModal: (id: string | null, type: ModalType) => void;
  /**
   * Close the modal and remove URL params
   */
  closeModal: () => void;
}

/**
 * Custom hook to manage modal state via URL search parameters
 * 
 * @example
 * ```tsx
 * const { modal, entityId, isOpen, openModal, closeModal } = useModalParams('userId');
 * 
 * // Open details modal
 * openModal('123', 'details');
 * // URL becomes: /users?userId=123&modal=details
 * 
 * // Close modal
 * closeModal();
 * // URL becomes: /users
 * ```
 */
export function useModalParams(
  idParam: string,
  options?: { modalParam?: string }
): UseModalParamsReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const modalParam = options?.modalParam || 'modal';

  const modal = useMemo(() => {
    const modalValue = searchParams.get(modalParam);
    if (modalValue === 'details' || modalValue === 'edit' || modalValue === 'create') {
      return modalValue as ModalType;
    }
    return null;
  }, [searchParams, modalParam]);

  const entityId = useMemo(() => {
    return searchParams.get(idParam);
  }, [searchParams, idParam]);

  const isOpen = useMemo(() => {
    return modal !== null && (entityId !== null || modal === 'create');
  }, [modal, entityId]);

  const openModal = useCallback(
    (id: string | null, type: ModalType) => {
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        
        if (id) {
          newParams.set(idParam, id);
        } else {
          newParams.delete(idParam);
        }
        
        newParams.set(modalParam, type);
        
        return newParams;
      });
    },
    [idParam, modalParam, setSearchParams]
  );

  const closeModal = useCallback(() => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete(idParam);
      newParams.delete(modalParam);
      return newParams;
    });
  }, [idParam, modalParam, setSearchParams]);

  return {
    modal,
    entityId,
    isOpen,
    openModal,
    closeModal,
  };
}
