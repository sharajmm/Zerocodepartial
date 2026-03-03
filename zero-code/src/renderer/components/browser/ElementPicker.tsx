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
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${isPickerActive
                    ? 'bg-accent/15 text-accent border border-accent/20 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                    : 'text-text-muted hover:text-text-secondary hover:bg-white/[0.04] border border-transparent'
                }`}
        >
            <MousePointer2 size={13} className={isPickerActive ? 'animate-pulse' : ''} />
            {isPickerActive ? 'Picking' : 'Pick'}
        </button>
    );
}