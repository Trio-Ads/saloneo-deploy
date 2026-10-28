import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SunIcon } from '@heroicons/react/24/outline';
import { teamAccessAPI } from '../../services/api';
import { Badge, EmptyState, PageHeader, Panel, StatGroup } from '../../components/ui';
import { useToastStore } from '../../components/Toast';
import { useTeamStore } from './store';
import { StaffAvatar } from './StaffAvatar';
import { Absence, StaffAccess } from './types';
import { AccessBadge } from './components/AccessSection';
import { Leave, LeaveRow, fmtDays, leaveTone, usePeriod } from '../staff/leave';

const labelClass = 'mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300';
const CONTRACTS = ['cdi', 'cdd', 'apprentissage', 'freelance'] as const;

interface HrFile {
  hr: { startDate?: string; contractType?: string; emergencyContact?: { name?: string; phone?: string }; notes?: string };
  leaveAllowance: number;
  balance: { year: number; allowance: number; taken: number; remaining: number };
  plannedMinutesThisMonth: number;
  scheduledMinutesThisMonth: number;
  month: string;
  absences: Absence[];
  leaves: Leave[];
  access: StaffAccess;
}

const hours = (min: number, lang: string) => (min / 60).toLocaleString(lang, { maximumFractionDigits: 1 });

/** Fiche employé (owner only): contract, emergency contact, notes, leave balance, planned hours, absences history. */
const EmployeeFilePage: React.FC = () => {
  const { t, i18n } = useTranslation('team');
  const { id = '' } = useParams();
  const member = useTeamStore((s) => s.members.find((m) => m.id === id));
  const showToast = useToastStore((s) => s.showToast);
  const period = usePeriod();
  const [file, setFile] = useState<HrFile | null>(null);
  const [missing, setMissing] = useState(false);
  const [form, setForm] = useState({ startDate: '', contractType: '', name: '', phone: '', notes: '', leaveAllowance: '30' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    teamAccessAPI.hr(id).then(({ data }) => {
      setFile(data);
      setForm({
        startDate: data.hr.startDate || '', contractType: data.hr.contractType || '',
        name: data.hr.emergencyContact?.name || '', phone: data.hr.emergencyContact?.phone || '',
        notes: data.hr.notes || '', leaveAllowance: String(data.leaveAllowance),
      });
    }).catch(() => setMissing(true));
  }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teamAccessAPI.updateHr(id, {
        hr: { startDate: form.startDate, contractType: form.contractType, emergencyContact: { name: form.name, phone: form.phone }, notes: form.notes },
        leaveAllowance: Number(form.leaveAllowance),
      });
      const { data } = await teamAccessAPI.hr(id);
      setFile(data);
      showToast(t('staff.file.saved'), 'success');
    } catch {
      showToast(t('staff.file.save_error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const back = (
    <Link to="/team" className="btn-ghost"><ArrowLeftIcon className="size-4 rtl:rotate-180" />{t('staff.file.back')}</Link>
  );
  if (missing) return <div className="py-6 sm:py-8"><Panel><EmptyState title={t('staff.file.not_found')} action={back} /></Panel></div>;
  if (!file) return <div className="flex justify-center py-24" role="status" aria-label={t('staff.loading')}><div className="size-8 animate-spin rounded-full border-2 border-gray-200 border-t-orange-500" /></div>;

  // Absences entered by hand in the member form (not from a request) also belong to the history
  const manual = file.absences.filter((a) => !a.leaveId);
  const lang = i18n.language;

  return (
    <div className="py-6 sm:py-8">
      <PageHeader
        title={member ? `${member.firstName} ${member.lastName}` : t('staff.file.title')}
        subtitle={t('staff.file.title')}
        meta={<>{member && <Badge>{t(`role_values.${member.role}`, member.role)}</Badge>}<AccessBadge access={file.access} /></>}
        actions={back}
      />

      <StatGroup items={[
        { label: t('staff.leaves.remaining'), value: fmtDays(file.balance.remaining, lang), hint: t('staff.leaves.working_days', { year: file.balance.year }), accent: true },
        { label: t('staff.leaves.taken'), value: fmtDays(file.balance.taken, lang), hint: t('staff.file.of_allowance', { allowance: fmtDays(file.balance.allowance, lang) }) },
        { label: t('staff.file.planned_hours'), value: `${hours(file.plannedMinutesThisMonth, lang)} h`, hint: t('staff.file.planned_hint', { scheduled: hours(file.scheduledMinutesThisMonth, lang) }) },
        { label: t('staff.file.absences_count'), value: file.leaves.filter((l) => l.status === 'approved').length + manual.length },
      ]} />

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title={t('staff.file.hr')} description={t('staff.file.hr_help')} className="lg:col-span-3 lg:self-start">
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            {member && (
              <div className="flex items-center gap-3 sm:col-span-2">
                <StaffAvatar member={member} />
                <p dir="ltr" className="min-w-0 truncate text-sm text-gray-500 text-start dark:text-gray-400">{[member.email, member.phone].filter(Boolean).join(' · ')}</p>
              </div>
            )}
            <div>
              <label htmlFor="hrStart" className={labelClass}>{t('staff.file.start_date')}</label>
              <input id="hrStart" type="date" className="field" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="hrContract" className={labelClass}>{t('staff.file.contract')}</label>
              <select id="hrContract" className="field" value={form.contractType} onChange={(e) => setForm((f) => ({ ...f, contractType: e.target.value }))}>
                <option value="">{t('staff.file.contract_none')}</option>
                {CONTRACTS.map((c) => <option key={c} value={c}>{t(`staff.contracts.${c}`)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="hrEmName" className={labelClass}>{t('staff.file.emergency_name')}</label>
              <input id="hrEmName" className="field" maxLength={80} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="hrEmPhone" className={labelClass}>{t('staff.file.emergency_phone')}</label>
              <input id="hrEmPhone" type="tel" dir="ltr" className="field text-start" maxLength={30} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label htmlFor="hrAllowance" className={labelClass}>{t('staff.file.allowance')}</label>
              <input id="hrAllowance" type="number" min={0} max={366} step={0.5} className="field tabular-nums" value={form.leaveAllowance} onChange={(e) => setForm((f) => ({ ...f, leaveAllowance: e.target.value }))} />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('staff.file.allowance_help')}</p>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="hrNotes" className={labelClass}>{t('staff.file.notes')}</label>
              <textarea id="hrNotes" rows={4} maxLength={2000} className="field" placeholder={t('staff.file.notes_placeholder')} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{t('staff.file.private')}</p>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving}>{t('staff.file.save')}</button>
            </div>
          </form>
        </Panel>

        <Panel title={t('staff.file.history')} flush className="lg:col-span-2 lg:self-start">
          {file.leaves.length === 0 && manual.length === 0 ? (
            <EmptyState icon={SunIcon} title={t('staff.file.no_absences')} />
          ) : (
            <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
              {file.leaves.filter((l) => l.status !== 'cancelled').map((l) => (
                <LeaveRow key={l.id} leave={l} aside={<Badge tone={leaveTone(l.status)}>{t(`staff.leave_status.${l.status}`)}</Badge>} />
              ))}
              {manual.map((a, i) => (
                <li key={`m-${i}`} className="flex items-start gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 first-letter:uppercase dark:text-gray-50">{period(a)}</p>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{a.reason || t('staff.file.manual_absence')}</p>
                  </div>
                  <Badge>{t('staff.file.manual')}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
};

export default EmployeeFilePage;
