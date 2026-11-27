import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const cancelRef = useRef(null);
  const triggerRef = useRef(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    triggerRef.current = document.activeElement;
    resolver.current = resolve;
    setDialog({ title: 'Please confirm', confirmLabel: 'Continue', tone: 'danger', ...options });
  }), []);

  const close = useCallback((accepted) => {
    resolver.current?.(accepted);
    resolver.current = null;
    setDialog(null);
    requestAnimationFrame(() => {
      if (triggerRef.current?.isConnected) triggerRef.current.focus();
      else document.querySelector('#main h1')?.focus?.();
    });
  }, []);

  useEffect(() => {
    if (!dialog) return undefined;
    cancelRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); close(false); }
      if (event.key !== 'Tab') return;
      const panel = document.querySelector('[data-confirm-dialog]');
      const items = [...panel.querySelectorAll('button:not(:disabled)')];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog, close]);

  return <ConfirmContext.Provider value={confirm}>{children}{dialog && createPortal(
    <div className="confirm-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close(false)}>
      <section className="confirm-dialog" data-confirm-dialog role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description">
        <span className="eyebrow">CONFIRM ACTION</span>
        <h2 id="confirm-title">{dialog.title}</h2>
        <p id="confirm-description">{dialog.message}</p>
        <footer><button ref={cancelRef} className="button secondary" onClick={() => close(false)}>Cancel</button><button className={`button ${dialog.tone === 'danger' ? 'danger-confirm' : 'primary'}`} onClick={() => close(true)}>{dialog.confirmLabel}</button></footer>
      </section>
    </div>, document.body,
  )}</ConfirmContext.Provider>;
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used inside ConfirmProvider.');
  return confirm;
}
