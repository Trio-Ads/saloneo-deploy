import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { PaperClipIcon, PlusIcon, SunIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { staffAPI } from '../../services/api';
import { Badge, EmptyState, IconButton, PageHeader, Panel, Segmented, StatGroup } from '../../components/ui';
import { useToastStore } from '../../components/Toast';
import { useStaffNotices } from './nav';
import { LeaveRow, LEAVE_TYPES, Leave, leaveTone, fmtDays } from './leave';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
const EMPTY = { from: '', to: '', partial: false, start: '09:00', end: '12:00', type: 'annual', reason: '' };

/** "Mes congés": balance, new request (days or hours, type, reason, certificate), history with the owner's answers. */
const MyLeavesPage: React.FC = () => {
  const { t, i18n } = useTranslation('team');
  const showToast = useToastStore((s) => s.showToast);
  const setUnread = useStaffNotices((s) => s.setUnread);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [balance, setBalance] = useState<{ allowance: number; taken: number; remaining: number; year: number } | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [attachment, setAttachment] = useState<{ id: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const load = useCallback(() => staffAPI.leaves().then(({ data }) => { setLeaves(data.leaves); setBalance(data.balance); }), []);
  useEffect(() => {
    load().then(() => staffAPI.markSeen()).then(() => setUnread(0)).catch(() => undefined);
  }, [load, setUnread]);

  const today = format(new Date(), 'yyyy-MM-dd');
  const pending = leaves.filter((l) => l.status === 'pending').length;
  const timesInvalid = form.partial && !(form.start && form.end && form.start < form.end);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { data } = await staffAPI.uploadAttachment(file);
      setAttachment(data.attachment);
    } catch {
      setError('staff.leaves.upload_error');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || timesInvalid) return;
    setSaving(true);
    setError('');
    try {
      await staffAPI.requestLeave({
        from: form.from,
        to: form.partial ? form.from : form.to && form.to >= form.from ? form.to : form.from,
        ...(form.partial ? { start: form.start, end: form.end } : {}),
        type: form.type,
        ...(form.reason.trim() ? { reason: form.reason.trim() } : {}),
        ...(attachment ? { attachment: { id: attachment.id } } : {}),
      });
      setForm(EMPTY);
      setAttachment(null);
      setOpen(false);
      showToast(t('staff.leaves.sent'), 'success');
      await load();
    } catch (err) {
      const code = ((err as AxiosError)?.response?.data as any)?.code;
      setError(code === 'LEAVE_OVERLAP' ? 'staff.leaves.overlap' : code === 'PAST_DATES' ? 'staff.leaves.past' : 'staff.leaves.error');
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm(t('staff.leaves.cancel_confirm'))) return;
    await staffAPI.cancelLeave(id);
    await load();
  };

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={t('staff.leaves.title')}
        subtitle={t('staff.leaves.subtitle')}
        actions={!open && (
          <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
            <PlusIcon className="size-4" />
            {t('staff.leaves.new')}
          </button>
        )}
      />

      {balance && (
        <StatGroup items={[
          { label: t('staff.leaves.remaining'), value: fmtDays(balance.remaining, i18n.language), hint: t('staff.leaves.working_days', { year: balance.year }), accent: true },
          { label: t('staff.leaves.taken'), value: fmtDays(balance.taken, i18n.language) },
          { label: t('staff.leaves.allowance'), value: fmtDays(balance.allowance, i18n.language) },
          { label: t('staff.leaves.pending'), value: pending },
        ]} />
      )}

      {open && (
        <Panel title={t('staff.leaves.new')} description={t('staff.leaves.new_help')} className="mb-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Segmented value={form.partial ? 'hours' : 'days'} onChange={(v) => setForm((f) => ({ ...f, partial: v === 'hours' }))} options={[
                { value: 'days', label: t('staff.leaves.full_days') },
                { value: 'hours', label: t('staff.leaves.some_hours') },
              ]} />
            </div>
            <div>
              <label htmlFor="leaveFrom" className={labelClass}>{t(form.partial ? 'staff.leaves.date' : 'staff.leaves.from')}</label>
              <input id="leaveFrom" type="date" required min={form.type === 'sick' ? undefined : today} value={form.from} className="field"
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))} />
            </div>
            {form.partial ? (
              <div>
                <p className={labelClass}>{t('staff.leaves.hours')}</p>
                <div className="flex items-center gap-2">
                  <input type="time" aria-label={t('staff.leaves.start')} value={form.start} className="field tabular-nums" onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
                  <span className="text-gray-400">–</span>
                  <input type="time" aria-label={t('staff.leaves.end')} value={form.end} className="field tabular-nums" onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
                </div>
                {timesInvalid && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{t('staff.leaves.hours_invalid')}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="leaveTo" className={labelClass}>{t('staff.leaves.to')}</label>
                <input id="leaveTo" type="date" min={form.from || today} value={form.to} className="field"
                  onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))} />
              </div>
            )}
            <div>
              <label htmlFor="leaveType" className={labelClass}>{t('staff.leaves.type')}</label>
              <select id="leaveType" value={form.type} className="field" onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {LEAVE_TYPES.map((type) => <option key={type} value={type}>{t(`staff.leave_types.${type}`)}</option>)}
              </select>
            </div>
            <div>
              <p className={labelClass}>{t('staff.leaves.attachment')}</p>
              {attachment ? (
                <div className="flex items-center gap-2 text-sm">
                  <PaperClipIcon className="size-4 text-gray-400" />
                  <span className="min-w-0 truncate text-gray-700 dark:text-gray-300">{attachment.name}</span>
                  <IconButton label={t('staff.leaves.remove_attachment')} tone="danger" onClick={() => setAttachment(null)}><XMarkIcon className="size-4" /></IconButton>
                </div>
              ) : (
                <button type="button" className="btn-secondary" disabled={uploading} onClick={() => fileInput.current?.click()}>
                  {uploading ? <span className="size-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" /> : <PaperClipIcon className="size-4" />}
                  {t('staff.leaves.add_attachment')}
                </button>
              )}
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('staff.leaves.attachment_help')}</p>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} aria-label={t('staff.leaves.add_attachment')} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="leaveReason" className={labelClass}>{t('staff.leaves.reason')}</label>
              <textarea id="leaveReason" rows={2} maxLength={500} value={form.reason} className="field" placeholder={t('staff.leaves.reason_placeholder')}
                onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2 dark:text-red-400">{t(error)}</p>}
            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => { setOpen(false); setForm(EMPTY); setAttachment(null); setError(''); }}>{t('staff.cancel')}</button>
              <button type="submit" className="btn-primary" disabled={saving || uploading || !form.from || timesInvalid}>{t('staff.leaves.send')}</button>
            </div>
          </form>
        </Panel>
      )}

      <Panel title={t('staff.leaves.history')} flush>
        {leaves.length === 0 ? (
          <EmptyState icon={SunIcon} title={t('staff.leaves.empty')} body={t('staff.leaves.empty_body')} />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {leaves.map((l) => (
              <LeaveRow key={l.id} leave={l} aside={
                <>
                  <Badge tone={leaveTone(l.status)}>{t(`staff.leave_status.${l.status}`)}</Badge>
                  {l.status === 'pending' && (
                    <IconButton label={t('staff.leaves.withdraw')} tone="danger" onClick={() => cancel(l.id)}><XMarkIcon className="size-5" /></IconButton>
                  )}
                </>
              } />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

export default MyLeavesPage;
