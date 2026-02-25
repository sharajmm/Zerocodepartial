export interface DOMElement {
    tag: string;
    id: string | null;
    classes: string | null;
    text: string;
    placeholder: string | null;
    href: string | null;
    ariaLabel: string | null;
    selector: string;
}