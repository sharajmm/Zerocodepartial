import { Minus, Square, X, Activity } from 'lucide-react';

const TopBar = () => {
    return (
        <div className="h-10 bg-panel border-b border-gray-800 flex items-center justify-between px-4 draggable text-gray-400">
            <div className="flex items-center gap-2">
                <Activity size={16} className="text-accent" />
                <span className="font-semibold text-sm text-gray-200">Zero Code</span>
            </div>

            {/* Window Controls (Mac/Win style placeholders) */}
            <div className="flex space-x-3 non-draggable opacity-50">
                <Minus size={14} className="hover:text-white cursor-pointer" />
                <Square size={14} className="hover:text-white cursor-pointer" />
                <X size={14} className="hover:text-red-500 cursor-pointer" />
            </div>
        </div>
    );
};

export default TopBar;
