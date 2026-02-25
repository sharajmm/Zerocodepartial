import { create } from 'zustand';
import type { DOMElement } from '../types/dom';

interface BrowserState {
    currentUrl: string;
    elementsMap: DOMElement[];
    isPickerActive: boolean;
    pinnedElements: DOMElement[];

    setCurrentUrl: (url: string) => void;
    setElementsMap: (elements: DOMElement[]) => void;
    setPickerActive: (active: boolean) => void;
    addPinnedElement: (element: DOMElement) => void;
    removePinnedElement: (selector: string) => void;
}

export const useBrowserStore = create<BrowserState>((set) => ({
    currentUrl: '',
    elementsMap: [],
    isPickerActive: false,
    pinnedElements: [],

    setCurrentUrl: (url) => set({ currentUrl: url }),
    setElementsMap: (elements) => set({ elementsMap: elements }),
    setPickerActive: (active) => set({ isPickerActive: active }),
    addPinnedElement: (element) =>
        set((state) => {
            // Avoid duplicates
            if (state.pinnedElements.some(e => e.selector === element.selector)) {
                return state;
            }
            return { pinnedElements: [...state.pinnedElements, element] };
        }),
    removePinnedElement: (selector) =>
        set((state) => ({
            pinnedElements: state.pinnedElements.filter(e => e.selector !== selector)
        })),
}));