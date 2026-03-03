import { MousePointer2 } from 'lucide-react';
import { useBrowserStore } from '../../store/browserStore';
import { useEffect } from 'react';

export default function ElementPicker() {
    const { isPickerActive, setPickerActive, addPinnedElement } = useBrowserStore();

    useEffect(() => {
        window.electronAPI.onPickerElement((data) => {
            addPinnedElement(data as any);
            setPickerActive(false);
        });
        return () => { window.electronAPI.removeAllListeners('picker:element-selected'); };
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
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all ${isPickerActive
                    ? 'bg-accent/10 text-accent border border-accent/15'
                    : 'text-text-muted/60 hover:text-text-secondary btn-surface'
                }`}
        >
            <MousePointer2 size={11} className={isPickerActive ? 'animate-pulse' : ''} />
            {isPickerActive ? 'Picking' : 'Pick'}
        </button>
    );
}