# Common Components

This directory contains reusable components used throughout the admin portal.

## DataTable

The **DataTable** component is the standard table component for displaying data in the admin panel. All pages MUST use this component instead of creating custom table implementations.

### Usage

```tsx
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true, // Enable sorting for this column
  },
  {
    accessorKey: 'email',
    header: 'Email',
    enableSorting: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false, // Disable sorting for action columns
    cell: ({ row }) => <Button onClick={() => handleAction(row.original)}>Action</Button>,
  },
];

<DataTable
  columns={columns}
  data={users}
  isLoading={isLoading}
  emptyMessage="No users found"
  emptyDescription="Try adjusting your filters"
/>;
```

### Features

- ✅ Automatic sorting with visual indicators (arrow icons)
- ✅ Column filtering support
- ✅ Loading states with skeleton loaders
- ✅ Empty states with customizable messages
- ✅ Type-safe with TypeScript generics
- ✅ Responsive design
- ✅ Consistent styling across all pages

### Props

- `columns`: Column definitions from TanStack Table
- `data`: Array of data to display
- `isLoading`: Show loading skeleton
- `emptyMessage`: Message when no data
- `emptyDescription`: Optional description for empty state
- `enableSorting`: Enable/disable sorting (default: true)
- `className`: Additional CSS classes

## Other Common Components

- **Pagination**: Standard pagination component
- **SearchInput**: Search input with debounce
- **FilterBar**: Filter bar container
- **LoadingSpinner**: Loading spinner
- **ErrorState**: Error display component
- **EmptyState**: Empty state component
- **ConfirmDialog**: Confirmation dialog
- **FormField**: Form field wrapper
- **DatePicker**: Date picker component
- **StatusBadge**: Status badge component
