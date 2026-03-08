import type { OrderStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getColor = () => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800 ring-gray-500/10';
      case 'PLACED': return 'bg-blue-50 text-blue-700 ring-blue-700/10';
      case 'COMPLETED': return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'CANCELLED': return 'bg-red-50 text-red-700 ring-red-600/10';
      default: return 'bg-gray-100 text-gray-800 ring-gray-500/10';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getColor()}`}>
      {status}
    </span>
  );
};
