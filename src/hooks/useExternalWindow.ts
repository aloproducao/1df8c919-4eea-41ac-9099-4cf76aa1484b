import { useEffect, useRef, useState } from 'react';

interface ExternalWindowOptions {
  title?: string;
  width?: number;
  height?: number;
}

export function useExternalWindow(options: ExternalWindowOptions = {}) {
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const open = () => {
    const { title = 'External Player', width = 1280, height = 720 } = options;
    
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Create a blank window first
    const newWindow = window.open(
      '',
      'external_player',
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (newWindow) {
      // Write the HTML content
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { 
                width: 100%;
                height: 100%;
                overflow: hidden;
                background: black;
                color-scheme: dark;
              }
              #root { 
                width: 100%;
                height: 100%;
                display: flex;
              }
              select {
                appearance: none;
                background-color: rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 6px;
                color: white;
                padding: 8px 32px 8px 12px;
                font-size: 14px;
                line-height: 20px;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 8px center;
                background-size: 16px;
              }
              select:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.5);
                box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
              }
              select option {
                background-color: #1f2937;
                color: white;
                padding: 8px;
              }
            </style>
          </head>
          <body>
            <div id="root"></div>
          </body>
        </html>
      `);
      
      newWindow.document.close();
      
      // Store reference to container
      containerRef.current = newWindow.document.getElementById('root') as HTMLDivElement;
      
      setExternalWindow(newWindow);
      setIsOpen(true);

      // Handle window close
      newWindow.addEventListener('beforeunload', () => {
        setExternalWindow(null);
        setIsOpen(false);
        containerRef.current = null;
      });

      // Focus the window
      newWindow.focus();
    }
  };

  const close = () => {
    if (externalWindow) {
      externalWindow.close();
      setExternalWindow(null);
      setIsOpen(false);
      containerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (externalWindow) {
        externalWindow.close();
      }
    };
  }, []);

  return {
    open,
    close,
    isOpen,
    containerRef: containerRef.current,
    window: externalWindow,
  };
}