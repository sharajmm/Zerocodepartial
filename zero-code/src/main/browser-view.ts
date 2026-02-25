import { BrowserView, BrowserWindow } from 'electron';
import { IPC } from '../shared/constants';
import { DOM_SCRAPE_SCRIPT } from '../renderer/lib/dom-scrape-script';

export class BrowserViewController {
    private view: BrowserView | null = null;
    private mainWindow: BrowserWindow;

    constructor(mainWindow: BrowserWindow) {
        this.mainWindow = mainWindow;
    }

    public init() {
        this.view = new BrowserView({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
            }
        });

        // We don't attach until frontend tells us its bounds when mounted
    }

    public mount(bounds: { x: number; y: number; width: number; height: number }) {
        if (!this.view) return;
        this.mainWindow.addBrowserView(this.view);
        this.setBounds(bounds);

        // Default load
        this.view.webContents.loadURL('https://example.com');
        this.setupListeners();
    }

    public setBounds(bounds: { x: number; y: number; width: number; height: number }) {
        if (!this.view) return;
        this.view.setBounds({
            x: Math.round(bounds.x),
            y: Math.round(bounds.y),
            width: Math.round(bounds.width),
            height: Math.round(bounds.height)
        });
    }

    public async navigate(url: string) {
        if (!this.view) return { success: false, url: '' };
        try {
            let finalUrl = url;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                finalUrl = 'https://' + url;
            }
            await this.view.webContents.loadURL(finalUrl);
            return { success: true, url: this.view.webContents.getURL() };
        } catch (error) {
            console.error('Navigation failed:', error);
            return { success: false, url: '' };
        }
    }

    public async scrapeDOM() {
        if (!this.view) return { elements: [] };
        try {
            const elements = await this.view.webContents.executeJavaScript(DOM_SCRAPE_SCRIPT);
            return { elements };
        } catch (error) {
            console.error('DOM scrape failed:', error);
            return { elements: [] };
        }
    }

    public async getUrl() {
        if (!this.view) return { url: '' };
        return { url: this.view.webContents.getURL() };
    }

    public async startPicker() {
        if (!this.view) return;
        const highlightScript = `
      (() => {
        if (window.__pickerActive) return;
        window.__pickerActive = true;
        
        const overlay = document.createElement('div');
        overlay.id = '__zero_code_overlay';
        overlay.style.position = 'fixed';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '999999';
        overlay.style.border = '2px solid #3b82f6';
        overlay.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);

        const tooltip = document.createElement('div');
        tooltip.id = '__zero_code_tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.zIndex = '1000000';
        tooltip.style.backgroundColor = '#15151e';
        tooltip.style.color = 'white';
        tooltip.style.padding = '4px 8px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontFamily = 'monospace';
        tooltip.style.fontSize = '12px';
        tooltip.style.display = 'none';
        document.body.appendChild(tooltip);

        const computeSelector = (el) => {
          if (el.id) return '#' + el.id;
          if (el.getAttribute('data-testid')) return '[data-testid="' + el.getAttribute('data-testid') + '"]';
          if (el.getAttribute('aria-label')) return '[aria-label="' + el.getAttribute('aria-label') + '"]';
          return el.tagName.toLowerCase();
        };

        window.__mousemoveHandler = (e) => {
          const target = e.target;
          if (target === document.body || target === document.documentElement) {
            overlay.style.display = 'none';
            tooltip.style.display = 'none';
            return;
          }
          const rect = target.getBoundingClientRect();
          overlay.style.display = 'block';
          overlay.style.top = rect.top + 'px';
          overlay.style.left = rect.left + 'px';
          overlay.style.width = rect.width + 'px';
          overlay.style.height = rect.height + 'px';

          tooltip.style.display = 'block';
          tooltip.style.top = (rect.bottom + 5) + 'px';
          tooltip.style.left = rect.left + 'px';
          tooltip.innerText = computeSelector(target);
          target.style.cursor = 'crosshair';
        };

        window.__clickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.target;
          const selector = computeSelector(target);
          const data = {
            selector,
            tagName: target.tagName,
            text: target.innerText?.substring(0, 30) || ''
          };
          window.postMessage({ type: 'ELEMENT_PICKED', data }, '*');
        };

        document.addEventListener('mousemove', window.__mousemoveHandler, true);
        document.addEventListener('click', window.__clickHandler, true);
      })();
    `;
        await this.view.webContents.executeJavaScript(highlightScript);

        // Ensure we can receive postMessage from injected script via IPC
        // Electron BrowserView doesn't easily let script send back unless using ipcRenderer inside it, 
        // but the page doesn't have nodeIntegration. 
        // We can inject a polling mechanism or use ipcMessage via preload if we attach one. 
        // Since we don't have preload on the remote page, we'll execute an observer:
        const emitScript = `
      window.addEventListener('message', (e) => {
        if(e.data && e.data.type === 'ELEMENT_PICKED') {
          console.log('__ZERO_CODE_PICKED__', JSON.stringify(e.data.data));
        }
      });
    `;
        await this.view.webContents.executeJavaScript(emitScript);

        // Listen to console messages from the page to fake IPC from untrusted origins
        this.view.webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
            if (message.startsWith('__ZERO_CODE_PICKED__')) {
                const json = message.replace('__ZERO_CODE_PICKED__ ', '');
                try {
                    const data = JSON.parse(json);
                    this.mainWindow.webContents.send(IPC.PICKER_ELEMENT_SELECTED, data);
                    // Auto stop after pick
                    this.stopPicker();
                } catch (e) { }
            }
        });

    }

    public async stopPicker() {
        if (!this.view) return;
        const cleanupScript = `
      (() => {
        window.__pickerActive = false;
        const overlay = document.getElementById('__zero_code_overlay');
        const tooltip = document.getElementById('__zero_code_tooltip');
        if (overlay) overlay.remove();
        if (tooltip) tooltip.remove();
        if (window.__mousemoveHandler) {
          document.removeEventListener('mousemove', window.__mousemoveHandler, true);
        }
        if (window.__clickHandler) {
          document.removeEventListener('click', window.__clickHandler, true);
        }
      })();
    `;
        await this.view.webContents.executeJavaScript(cleanupScript);
        this.view.webContents.removeAllListeners('console-message');
    }

    private setupListeners() {
        if (!this.view) return;
        this.view.webContents.on('did-navigate', (_, url) => {
            this.mainWindow.webContents.send(IPC.BROWSER_NAVIGATED, { url });
        });
        this.view.webContents.on('did-navigate-in-page', (_, url) => {
            this.mainWindow.webContents.send(IPC.BROWSER_NAVIGATED, { url });
        });
    }

    public goBack() {
        if (this.view?.webContents.canGoBack()) {
            this.view.webContents.goBack();
        }
    }

    public goForward() {
        if (this.view?.webContents.canGoForward()) {
            this.view.webContents.goForward();
        }
    }

    public reload() {
        this.view?.webContents.reload();
    }
}