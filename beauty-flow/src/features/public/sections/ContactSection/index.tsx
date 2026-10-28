import { SectionProps } from '../types';
import { ContactItems, HoursTable, Section, Title, useSalon } from '../kit';

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

export function ContactSection(props: SectionProps) {
  switch (props.template.sections.contact.variant) {
    case 'centered': return <ContactCentered {...props} />;
    case 'minimal':  return <ContactMinimal {...props} />;
    default:         return <ContactSplit {...props} />;
  }
}
