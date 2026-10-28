import React from 'react';
import { createRoot } from 'react-dom/client';
import Modal from './Modal';

/** In-app replacement for window.confirm: resolves true on confirm, false on cancel / Escape / backdrop. */
export function confirmDialog(opts: { title: string; message: string; confirmLabel: string; cancelLabel: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const done = (ok: boolean) => {
      root.unmount();
      host.remove();
      resolve(ok);
    };
    root.render(
      <Modal isOpen size="sm" title={opts.title} onClose={() => done(false)} showCloseButton={false}>
        <p className="text-sm text-gray-600 dark:text-gray-300">{opts.message}</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" autoFocus className="btn-secondary" onClick={() => done(false)}>{opts.cancelLabel}</button>
          <button type="button" className="btn-primary" onClick={() => done(true)}>{opts.confirmLabel}</button>
        </div>
      </Modal>
    );
  });
}
