import { SectionProps } from '../types';
import { Arrow, ContactItems, HoursTable, Icon, Section, Title, TodayHours, telHref, useSalon } from '../kit';

type P = SectionProps;

const BookLink = ({ data }: Pick<P, 'data'>) => {
  const { t } = useSalon(data);
  return data.services.length ? <a href="#services" className="sp-btn">{t('site.book')}</a> : null;
};

/** Details on one side, opening hours on a card on the other (or the details spread out when there are no hours). */
function ContactSplit({ data }: P) {
  const { t, hours } = useSalon(data);
  return (
    <Section id="contact">
      <div className={`grid gap-12 md:gap-16 ${hours.length ? 'md:grid-cols-2' : ''}`}>
        <div>
          <Title>{t('site.contact_title')}</Title>
          <ContactItems data={data} className={`grid gap-7 ${hours.length ? '' : 'sm:grid-cols-3'}`} />
          <div className="mt-10"><BookLink data={data} /></div>
        </div>
        {hours.length > 0 && (
          <div className="sp-card p-6 md:p-8 self-start">
            <h3 className="text-xl mb-3">{t('site.hours')}</h3>
            <HoursTable data={data} />
          </div>
        )}
      </div>
    </Section>
  );
}

function ContactCentered({ data }: P) {
  const { t, hours } = useSalon(data);
  return (
    <Section id="contact" className="sp-surface">
      <div className="text-center flex flex-col items-center">
        <Title>{t('site.contact_title')}</Title>
        <ContactItems data={data} className="flex flex-wrap justify-center gap-x-14 gap-y-7" />
        {hours.length > 0 && (
          <div className="mt-12 w-full max-w-sm text-start">
            <h3 className="text-xl mb-3 text-center">{t('site.hours')}</h3>
            <HoursTable data={data} />
          </div>
        )}
        <div className="mt-12"><BookLink data={data} /></div>
      </div>
    </Section>
  );
}

/** A title on the left, a ruled list of facts on the right. */
function ContactMinimal({ data }: P) {
  const { t, hours } = useSalon(data);
  return (
    <Section id="contact">
      <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16 border-t sp-line pt-10 md:pt-14">
        <Title>{t('site.contact_title')}</Title>
        <div>
          <ContactItems data={data} itemClass="grid sm:grid-cols-[10rem_1fr] sm:items-baseline gap-1 sm:gap-6 py-5 border-b sp-line [&>dd]:mt-0" />
          {hours.length > 0 && (
            <div className="grid sm:grid-cols-[10rem_1fr] sm:items-baseline gap-1 sm:gap-6 py-5 border-b sp-line">
              <p className="sp-muted text-sm">{t('site.hours')}</p>
              <HoursTable data={data} className="text-lg [&>div]:py-1 [&>div]:border-0" />
            </div>
          )}
          <div className="mt-10"><BookLink data={data} /></div>
        </div>
      </div>
    </Section>
  );
}

/** The opening hours are the visual: one large line per day, today highlighted. */
function ContactHoursBoard(props: P) {
  const { data } = props;
  const { t, week } = useSalon(data);
  if (!week.length) return <ContactSplit {...props} />;
  return (
    <Section id="contact">
      <div className="grid md:grid-cols-[1.5fr_1fr] gap-12 md:gap-20">
        <div>
          <Title>{t('site.hours')}</Title>
          <ol className="border-t sp-line">
            {week.map(d => (
              <li key={d.day} aria-current={d.today ? 'date' : undefined}
                className={`sp-hb-row flex items-baseline justify-between gap-4 py-3 md:py-4 border-b sp-line ${d.today ? 'is-today' : ''}`}>
                <span className="sp-h text-2xl md:text-4xl">{d.day}</span>
                <span className={`sp-num text-lg md:text-2xl ${d.value ? '' : 'sp-muted'}`}>{d.value ?? t('site.closed')}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="md:pt-24">
          <h3 className="text-xl md:text-2xl mb-6">{t('site.contact_title')}</h3>
          <ContactItems data={data} className="grid gap-7" />
          <div className="mt-10"><BookLink data={data} /></div>
        </div>
      </div>
    </Section>
  );
}

/** One compact card: address, call, directions, today's hours (the week folds out). */
function ContactCard({ data }: P) {
  const { t, name, address, mapsUrl, phone, hours, today } = useSalon(data);
  return (
    <Section id="contact" className="sp-surface">
      <h2 className="sr-only">{t('site.contact_title')}</h2>
      <div className="sp-contact-card max-w-md mx-auto p-6 md:p-8">
        <p className="sp-h text-3xl md:text-4xl">{name}</p>
        <div className="mt-5 grid gap-3">
          {address && <p className="flex gap-3"><Icon name="pin" size={20} className="sp-ink mt-0.5" />{address}</p>}
          {today && <p className="flex gap-3"><Icon name="clock" size={20} className="sp-ink mt-0.5" /><TodayHours data={data} /></p>}
        </div>
        {(phone || address) && (
          <div className="mt-7 flex flex-wrap gap-2 [&>*]:flex-1">
            {phone && <a href={telHref(phone)} className="sp-btn"><Icon name="phone" size={18} />{t('site.call')}</a>}
            {address && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="sp-btn sp-btn-ghost"><Icon name="pin" size={18} />{t('site.directions')}</a>}
          </div>
        )}
        {hours.length > 0 && (
          <details className="sp-acc mt-6 border-t sp-line">
            <summary className="flex items-center justify-between min-h-[3.25rem] cursor-pointer font-medium">
              {t('site.hours')}<Icon name="chevron" size={18} className="sp-acc-chevron sp-muted" />
            </summary>
            <HoursTable data={data} className="pb-2" />
          </details>
        )}
        {data.services.length > 0 && (
          <a href="#services" className="sp-link inline-flex items-center gap-2 mt-6">{t('site.book')} <Arrow /></a>
        )}
      </div>
    </Section>
  );
}

export function ContactSection(props: SectionProps) {
  switch (props.template.sections.contact.variant) {
    case 'centered': return <ContactCentered {...props} />;
    case 'minimal':  return <ContactMinimal {...props} />;
    case 'hours-board': return <ContactHoursBoard {...props} />;
    case 'card':     return <ContactCard {...props} />;
    default:         return <ContactSplit {...props} />;
  }
}
