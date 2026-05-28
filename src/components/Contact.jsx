import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'olimovmax2003@gmail.com' },
  { icon: Phone, label: 'Phone', value: '+998 90 040 67 28' },
  { icon: MapPin, label: 'Location', value: 'Fegana, Uzbekistan' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="section-deep py-14">
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#0ea5e9]/08 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="gold-badge mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]" />
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            We'd love to{' '}
            <span className="gradient-text">
              hear from you
            </span>
          </h2>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Have questions about our courses or platform? Reach out and we'll respond within 24 hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left info */}
          <div className="lg:col-span-2 space-y-5">
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="premium-card premium-card-hover flex items-center gap-4 p-5 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0ea5e9]/10">
                    <Icon className="h-5 w-5 text-[#0ea5e9]" />
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">{item.label}</div>
                    <div className="text-white font-medium text-sm">{item.value}</div>
                  </div>
                </div>
              );
            })}


          </div>

          {/* Right form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="premium-card flex h-full flex-col items-center justify-center rounded-3xl p-10 text-center animate-scale-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#8b5cf6]">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Message Sent!</h3>
                <p className="text-gray-400">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                  className="mt-6 text-sm font-medium text-[#0ea5e9] transition-colors hover:text-white"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="premium-card space-y-4 rounded-3xl p-6 animate-scale-in">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Olimov Asadbek"
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="olimovmax2003@gmail.com"
                      className="field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="How can we help you?"
                    className="field resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full py-3"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
