import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClearFiltersButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

export function ClearFiltersButton({ onClear, disabled }: ClearFiltersButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClear}
      disabled={disabled}
      className="shrink-0"
    >
      <X className="h-4 w-4 mr-1" />
      Clear all filters
    </Button>
  );
}
