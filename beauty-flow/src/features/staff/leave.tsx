import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import { BadgeTone } from '../../components/ui';
import { getDateLocale } from '../appointments/utils';
import { staffAPI } from '../../services/api';
import { StaffAvatar } from '../team/StaffAvatar';

export const LEAVE_TYPES = ['annual', 'sick', 'personal', 'other'] as const;
export type LeaveStatus = 'pending' | 'approved' | 'refused' | 'cancelled';

export interface Leave {
  id: string;
  teamMemberId: string;
  from: string;
  to: string;
  start?: string;
  end?: string;
  type: typeof LEAVE_TYPES[number];
  reason?: string;
  attachment?: { id: string; name?: string };
  status: LeaveStatus;
  decision?: { comment?: string; at: string };
  days: number;
  createdAt: string;
  member?: { id: string; firstName: string; lastName: string; avatar?: string; color?: string };
}

export interface Conflict { id: string; date: string; startTime: string; endTime: string; status: string; client: string; service: string }

export const leaveTone = (s: LeaveStatus): BadgeTone => ({ pending: 'orange', approved: 'green', refused: 'red', cancelled: 'neutral' } as const)[s];

/** 2.5 → "2,5" in French */
export const fmtDays = (n: number, lang: string) => n.toLocaleString(lang, { maximumFractionDigits: 1 });

export function usePeriod() {
  const { i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);
  const day = (d: string) => format(parseISO(d), 'EEE d MMM yyyy', { locale });
  return (l: Pick<Leave, 'from' | 'to' | 'start' | 'end'>) =>
    (l.from === l.to ? day(l.from) : `${day(l.from)} – ${day(l.to)}`) + (l.start && l.end ? ` · ${l.start}–${l.end}` : '');
}

/** Certificates are private (no public URL): fetched with the session, shown from a blob URL. */
async function openAttachment(id: string) {
  const tab = window.open('', '_blank'); // opened on the click, before the await, so it is not blocked
  try {
    const { data } = await staffAPI.openAttachment(id);
    const url = URL.createObjectURL(data);
    if (tab) tab.location.href = url; else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch {
    tab?.close();
  }
}

/** One leave request: period, type and days, reason, certificate, the owner's comment; `aside` = status + actions. */
export const LeaveRow: React.FC<{ leave: Leave; aside?: React.ReactNode; children?: React.ReactNode }> = ({ leave: l, aside, children }) => {
  const { t, i18n } = useTranslation('team');
  const period = usePeriod();
  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        {l.member && <StaffAvatar member={l.member} />}
        <div className="min-w-0 flex-1">
          {l.member && <p className="font-medium text-gray-900 dark:text-gray-50">{l.member.firstName} {l.member.lastName}</p>}
          <p className={l.member ? 'text-sm text-gray-700 first-letter:uppercase dark:text-gray-300' : 'font-medium text-gray-900 first-letter:uppercase dark:text-gray-50'}>{period(l)}</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {t(`staff.leave_types.${l.type}`)} · {t('staff.days_count', { count: l.days, formatted: fmtDays(l.days, i18n.language) })}
          </p>
          {l.reason && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{l.reason}</p>}
          {l.attachment && (
            <button type="button" onClick={() => openAttachment(l.attachment!.id)} className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400">
              <PaperClipIcon className="size-4" />{l.attachment.name || t('staff.leaves.attachment')}
            </button>
          )}
          {l.decision?.comment && (
            <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              <span className="font-medium">{t('staff.leaves.owner_comment')}</span> {l.decision.comment}
            </p>
          )}
          {children}
        </div>
        {aside && <div className="flex shrink-0 items-center gap-2">{aside}</div>}
      </div>
    </li>
  );
};
