import { memo, useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useInView } from '../hooks/useInView';

const contactInfoKeys = [
  { icon: Mail,    labelKey: 'contact.emailLabel',    value: 'olimovmax2003@gmail.com' },
  { icon: Phone,   labelKey: 'contact.phoneLabel',    value: '+998 90 040 67 28' },
  { icon: MapPin,  labelKey: 'contact.locationLabel', value: 'Fergana, Uzbekistan' },
];

const InfoCard = memo(function InfoCard({ item, index, visible }) {
  const { t } = useTranslation();
  const Icon = item.icon;
  return (
    <div
      className="premium-card premium-card-hover flex items-center gap-4 p-5 transition-[transform,border-color,background-color]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(18px)',
        transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`,
      }}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0ea5e9]/10">
        <Icon className="h-5 w-5 text-[#0ea5e9]" />
      </div>
      <div>
        <div className="text-gray-400 text-xs">{t(item.labelKey)}</div>
        <div className="text-white font-medium text-sm">{item.value}</div>
      </div>
    </div>
  );
});

export default function Contact() {
  const { t } = useTranslation();
  const [ref, inView] = useInView(0.06);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

  return (
    <section id="contact" className="section-deep py-14" ref={ref}>
      {/* pointer-events-none prevents blob from intercepting hover events */}
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#0ea5e9]/08 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          className="text-center mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <div className="gold-badge mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>{t('contact.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {t('contact.title')}{' '}
            <span className="gradient-text">{t('contact.highlight')}</span>
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left info cards */}
          <div className="lg:col-span-2 space-y-5">
            {contactInfoKeys.map((item, i) => (
              <InfoCard key={i} item={item} index={i} visible={inView} />
            ))}
          </div>

          {/* Right form */}
          <div
            className="lg:col-span-3"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'scale(1)' : 'scale(0.97)',
              transition: 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
            }}
          >
            {sent ? (
              <div className="premium-card flex h-full flex-col items-center justify-center rounded-3xl p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6]">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{t('contact.sentTitle')}</h3>
                <p className="text-gray-400">{t('contact.sentDesc')}</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-6 text-sm font-medium text-[#0ea5e9] transition-colors hover:text-white"
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="premium-card space-y-4 rounded-3xl p-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">{t('contact.fullName')}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder={t('contact.namePlaceholder')} className="field" />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">{t('contact.emailLabel')}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder={t('contact.emailPlaceholder')} className="field" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">{t('contact.message')}</label>
                  <textarea name="message" value={form.message} onChange={handleChange} required rows={5} placeholder={t('contact.messagePlaceholder')} className="field resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full py-3">
                  <Send className="w-4 h-4" />
                  {t('contact.send')}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
