import { useEffect } from 'react';
import i18n from 'i18next';
import { confirmDialog } from '../components/confirmDialog';

const dirtyForms = new Set<string>();
let bypass = false; // set while replaying a link click the user confirmed

/** True while any form registered with useUnsavedChanges has unsaved edits (e.g. before switching tabs). */
export const hasUnsavedChanges = () => dirtyForms.size > 0;

/** In-app "leave without saving?" dialog. */
export const confirmLeave = () => confirmDialog({
  title: i18n.t('common:unsaved.title'),
  message: i18n.t('common:unsaved.message'),
  confirmLabel: i18n.t('common:unsaved.leave'),
  cancelLabel: i18n.t('common:unsaved.stay'),
});

/**
 * While `dirty`, asks before leaving: the browser's own prompt on reload/close (beforeunload), and the in-app
 * dialog on internal links (BrowserRouter has no navigation blocker, so <a> clicks are caught in the capture phase
 * and replayed once confirmed).
 */
export function useUnsavedChanges(key: string, dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    dirtyForms.add(key);
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    const onClick = (e: MouseEvent) => {
      if (bypass) return;
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link || link.target === '_blank' || link.origin !== window.location.origin || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const ev = e as MouseEvent & { unsavedAsked?: boolean };
      if (ev.unsavedAsked) return; // several dirty forms: ask once
      ev.unsavedAsked = true;
      e.preventDefault();
      e.stopPropagation();
      confirmLeave().then((ok) => {
        if (!ok) return;
        bypass = true;
        link.click();
        bypass = false;
      });
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      dirtyForms.delete(key);
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [key, dirty]);
}
