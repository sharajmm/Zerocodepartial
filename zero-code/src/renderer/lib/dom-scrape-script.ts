export const DOM_SCRAPE_SCRIPT = `
(() => {
  const interactiveSelectors = 'button, a, input, select, textarea, [role="button"], [role="link"], [role="checkbox"], [role="tab"]';
  const elements = Array.from(document.querySelectorAll(interactiveSelectors));

  // Filter 1: Element must be physically visible in the viewport or layout
  const isVisible = (el) => {
    // Check bounding rect
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    
    // Check computed styles
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    
    return true;
  };

  // Filter 2: Element must have some semantic meaning/reason to interact
  const hasMeaning = (el) => {
    // Interactive inputs always have meaning
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) return true;
    
    // Check for readable text or aria labels
    const text = (el.innerText || '').trim();
    const aria = el.getAttribute('aria-label');
    const title = el.getAttribute('title');
    
    return text.length > 0 || aria !== null || title !== null;
  };

  // Run filters
  const validElements = elements.filter(el => isVisible(el) && hasMeaning(el));

  return validElements.slice(0, 200).map((el) => {
    const computeSelector = (el) => {
      if (el.id) return '#' + el.id;
      if (el.getAttribute('data-testid')) return '[data-testid="' + el.getAttribute('data-testid') + '"]';
      if (el.getAttribute('aria-label')) return '[aria-label="' + el.getAttribute('aria-label') + '"]';
      
      const tag = el.tagName.toLowerCase();
      const parent = el.parentElement;
      if (!parent) return tag;
      const siblings = Array.from(parent.querySelectorAll(':scope > ' + tag));
      const index = siblings.indexOf(el) + 1;
      return tag + ':nth-of-type(' + index + ')';
    };
    return {
      tag: el.tagName,
      id: el.id || null,
      classes: el.className || null,
      text: (el.innerText || '').trim().substring(0, 80),
      placeholder: el.placeholder || null,
      href: el.href || null,
      ariaLabel: el.getAttribute('aria-label') || null,
      selector: computeSelector(el)
    };
  });
})()
`;