import { MousePointer2 } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';
import { useEffect } from 'react';

export default function ElementPicker() {
    const { isPickerActive, setPickerActive, addPinnedElement } = useBrowserStore();

    useEffect(() => {
        // Listen for element selection
        window.electronAPI.onPickerElement((data) => {
            addPinnedElement(data as any);
            setPickerActive(false);
        });

        return () => {
            window.electronAPI.removeAllListeners('picker:element-selected');
        };
    }, [addPinnedElement, setPickerActive]);

    const togglePicker = async () => {
        if (isPickerActive) {
            await window.electronAPI.pickerStop();
            setPickerActive(false);
        } else {
            await window.electronAPI.pickerStart();
            setPickerActive(true);
        }
    };

    return (
        <button
            onClick={togglePicker}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isPickerActive
                    ? 'bg-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
        >
            <MousePointer2 size={16} className={isPickerActive ? 'animate-pulse' : ''} />
            {isPickerActive ? 'Picking...' : 'Pick Element'}
        </button>
    );
}