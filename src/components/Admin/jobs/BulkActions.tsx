import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

const BulkActions = ({
  selectedCount,
  onAction,
}: {
  selectedCount: number;
  onAction: (action: 'hide' | 'show' | 'delete') => void;
}) => (
  <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 flex justify-between items-center">
    <span className="text-[#10b981] font-medium">
      {selectedCount} selected
    </span>
    <div className="flex gap-3">
      <button
        onClick={() => onAction('show')}
        className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-sm flex items-center gap-1"
      >
        <Eye className="h-4 w-4" /> Show
      </button>
      <button
        onClick={() => onAction('hide')}
        className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#047857] text-white text-sm flex items-center gap-1"
      >
        <EyeOff className="h-4 w-4" /> Hide
      </button>
      <button
        onClick={() => onAction('delete')}
        className="px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white text-sm flex items-center gap-1"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </div>
  </div>
);

export default BulkActions;
