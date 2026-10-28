import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ExclamationTriangleIcon, SunIcon } from '@heroicons/react/24/outline';
import { teamAccessAPI } from '../../../services/api';
import { Badge, Panel, Segmented } from '../../../components/ui';
import { useToastStore } from '../../../components/Toast';
import { getDateLocale } from '../../appointments/utils';
import { Conflict, Leave, LeaveRow, leaveTone } from '../../staff/leave';
import { useTeamStore } from '../store';

/** Owner: number of leave requests waiting (Team header badge, dashboard alert). */
export function usePendingLeaves(enabled = true) {
  const [pending, setPending] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    teamAccessAPI.leaves({ status: 'pending' }).then(({ data }) => setPending(data.pending)).catch(() => setPending(0));
  }, [enabled]);
  return pending;
}

/** Appointments an approved leave lands on: the owner reschedules or reassigns them (nothing is cancelled automatically). */
export const ConflictList: React.FC<{ conflicts: Conflict[] }> = ({ conflicts }) => {
  const { t, i18n } = useTranslation('team');
  if (!conflicts.length) return null;
  const locale = getDateLocale(i18n.language);
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
      <p className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-200">
        <ExclamationTriangleIcon className="size-4 shrink-0" />
        {t('staff.decision.conflicts', { count: conflicts.length })}
      </p>
      <ul className="mt-2 space-y-1 text-sm text-amber-900 dark:text-amber-100">
        {conflicts.map((c) => (
          <li key={c.id} className="flex flex-wrap gap-x-2">
            <span className="tabular-nums first-letter:uppercase">{format(parseISO(c.date), 'EEE d MMM', { locale })} · {c.startTime}–{c.endTime}</span>
            <span className="text-amber-800/80 dark:text-amber-200/80">{[c.client, c.service].filter(Boolean).join(' · ')}</span>
          </li>
        ))}
      </ul>
      <Link to="/appointments" className="mt-2 inline-block text-sm font-medium text-orange-700 hover:text-orange-800 dark:text-orange-300">{t('staff.decision.open_agenda')}</Link>
    </div>
  );
};

/** Team page: leave requests to approve/refuse (with a comment), and the recent answers. */
const LeaveRequests: React.FC<{ onPendingChange?: (n: number) => void }> = ({ onPendingChange }) => {
  const { t } = useTranslation('team');
  const fetchMembers = useTeamStore((s) => s.fetchMembers);
  const showToast = useToastStore((s) => s.showToast);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [conflicts, setConflicts] = useState<Record<string, Conflict[]>>({});
  const [busy, setBusy] = useState<string | null>(null);
  // Answered in this visit: stays in "À traiter" with its result and conflicts until the page is left
  const [answered, setAnswered] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const { data } = await teamAccessAPI.leaves({ status: filter === 'pending' ? 'pending' : 'all' });
    setLeaves(data.leaves);
    onPendingChange?.(data.pending);
  }, [filter, onPendingChange]);
  useEffect(() => { load().catch(() => undefined); }, [load]);

  const decide = async (l: Leave, decision: 'approve' | 'refuse') => {
    setBusy(l.id);
    try {
      const { data } = await teamAccessAPI.decide(l.id, decision, comments[l.id]?.trim() || undefined);
      if (decision === 'approve') {
        setConflicts((c) => ({ ...c, [l.id]: data.conflicts }));
        void fetchMembers(); // the new absence shows in the member's form
      }
      setAnswered((s) => new Set(s).add(l.id));
      const next = leaves.map((x) => (x.id === l.id ? { ...x, ...data.leave, member: x.member } : x));
      setLeaves(next);
      onPendingChange?.(next.filter((x) => x.status === 'pending').length);
      showToast(t(decision === 'approve' ? 'staff.decision.approved' : 'staff.decision.refused'), 'success');
    } catch {
      showToast(t('staff.decision.error'), 'error');
      await load();
    } finally {
      setBusy(null);
    }
  };

  const shown = filter === 'pending' ? leaves.filter((l) => l.status === 'pending' || answered.has(l.id)) : leaves.filter((l) => l.status !== 'cancelled');

  return (
    <Panel
      title={t('staff.decision.title')}
      description={t('staff.decision.description')}
      actions={<Segmented value={filter} onChange={setFilter} options={[{ value: 'pending', label: t('staff.decision.to_decide') }, { value: 'all', label: t('staff.decision.all') }]} />}
      className="mb-6"
      flush
    >
      {shown.length === 0 ? (
        <p className="flex items-center gap-2 px-5 pb-5 text-sm text-gray-500 dark:text-gray-400">
          <SunIcon className="size-4 shrink-0 text-gray-400" />
          {t(filter === 'pending' ? 'staff.decision.none_pending' : 'staff.decision.none')}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
          {shown.map((l) => (
            <LeaveRow key={l.id} leave={l} aside={l.status !== 'pending' && <Badge tone={leaveTone(l.status)}>{t(`staff.leave_status.${l.status}`)}</Badge>}>
              {l.status === 'pending' && (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input className="field min-w-0 flex-1" maxLength={500} placeholder={t('staff.decision.comment_placeholder')} aria-label={t('staff.decision.comment')}
                    value={comments[l.id] || ''} onChange={(e) => setComments((c) => ({ ...c, [l.id]: e.target.value }))} />
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary flex-1" disabled={busy === l.id} onClick={() => decide(l, 'refuse')}>{t('staff.decision.refuse')}</button>
                    <button type="button" className="btn-primary flex-1" disabled={busy === l.id} onClick={() => decide(l, 'approve')}>{t('staff.decision.approve')}</button>
                  </div>
                </div>
              )}
              {l.status === 'approved' && !conflicts[l.id] && (
                <button type="button" className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  onClick={() => teamAccessAPI.conflicts(l.id).then(({ data }) => setConflicts((c) => ({ ...c, [l.id]: data.conflicts })))}>
                  {t('staff.decision.check_conflicts')}
                </button>
              )}
              {conflicts[l.id] && (conflicts[l.id].length
                ? <ConflictList conflicts={conflicts[l.id]} />
                : <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('staff.decision.no_conflicts')}</p>)}
            </LeaveRow>
          ))}
        </ul>
      )}
    </Panel>
  );
};

export default LeaveRequests;
