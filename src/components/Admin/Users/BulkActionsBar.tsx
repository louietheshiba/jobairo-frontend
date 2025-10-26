import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onActivate: () => void;
  onSuspend: () => void;
  onDeactivate: () => void;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount, onActivate, onSuspend, onDeactivate
}) => (
  <div className="bg-[#10b981]/5 border border-[#10b981]/20 rounded-xl p-4 flex items-center justify-between">
    <span className="text-sm text-[#10b981] font-medium">
      {selectedCount} user{selectedCount > 1 ? 's' : ''} selected
    </span>
    <div className="flex space-x-3">
      <button onClick={onActivate} className="btn-secondary">
        <Eye className="h-4 w-4 mr-1 inline" /> Activate
      </button>
      <button onClick={onSuspend} className="btn-secondary">
        <EyeOff className="h-4 w-4 mr-1 inline" /> Suspend
      </button>
      <button onClick={onDeactivate} className="btn-danger">
        <Trash2 className="h-4 w-4 mr-1 inline" /> Deactivate
      </button>
    </div>
  </div>
);

export default BulkActionsBar;
