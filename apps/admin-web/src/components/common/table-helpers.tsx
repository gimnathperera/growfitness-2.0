import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Helper to create a sortable column header
 * Use this in your column definitions to enable sorting with visual indicators
 */
export function createSortableHeader<T>(label: string): ColumnDef<T>['header'] {
  return ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-8 px-2 lg:px-3"
      >
        {label}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  };
}
