import { Link } from 'react-router-dom';
import { ArrowRight, GraduationCap, Mail, MessageCircle, Phone } from 'lucide-react';

const contacts = [
  { icon: Phone, label: '+998900406728', href: 'tel:+998900406728' },
  { icon: MessageCircle, label: '@itisteacher_max', href: 'https://t.me/itisteacher_max' },
  { icon: Mail, label: 'olimovmax2003@gmail.com', href: 'mailto:olimovmax2003@gmail.com' },
];

export default function AboutPage() {
  return (
    <div
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className="relative min-h-screen overflow-hidden  text-white pt-[60px]"
    >
      {/* Blob decorations */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: '-80px', left: '-80px', width: '320px', height: '320px',
          background: '#004D98',
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          opacity: 0.28, zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          bottom: '-60px', right: '-60px', width: '260px', height: '260px',
          background: '#A50044',
          borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%',
          opacity: 0.24, zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          top: '40%', left: '35%', width: '180px', height: '180px',
          background: '#EDBB00',
          borderRadius: '50% 50% 40% 60% / 40% 60% 40% 60%',
          opacity: 0.10, zIndex: 0,
        }}
      />

      {/* Hero */}
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-70px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-12">

        {/* Image side */}
        <div className="relative flex items-end justify-center">
          {/* Navy accent bar */}
          <div
            className="absolute bottom-10 left-0 z-0 w-12 rounded-r-xl"
            style={{ height: '180px', background: '#A50044' }}
          />
          {/* Blob background */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '390px', height: '390px',
              background: 'linear-gradient(135deg, #004D98, #A50044 62%, #EDBB00)',
              borderRadius: '50% 50% 40% 60% / 50% 40% 60% 50%',
              opacity: 0.24, zIndex: 0,
            }}
          />
          {/* Photo frame */}
          <div
            className="relative z-10 overflow-hidden border-4 border-[#EDBB00]/80 shadow-2xl"
            style={{
              width: 'min(340px, 86vw)', height: 'min(460px, 116vw)',
              borderRadius: '50% 50% 0 0 / 50% 50% 0 0',
              background: 'linear-gradient(160deg, #004D98 0%, #A50044 55%, #EDBB00 100%)',
              boxShadow: '0 24px 70px rgba(0,77,152,0.30)',
            }}
          >
            <img
              src="/IMG_0723.JPG"
              alt="Asadbek Olimov"
              className="h-full w-full object-cover"
              style={{ objectPosition: '55% 48%' }}
            />
          </div>
        </div>

        {/* Text side */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#EDBB00]">
            English Teacher (Mr. Max)
          </p>

          <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
            Hello, I&apos;m{' '}
            <span className="barca-gradient-text">Asadbek Olimov</span>
          </h1>

          <p className="mt-2 text-lg font-semibold text-[#EDBB00]">English Teacher (Mr. Max)</p>

          <div className="mt-5 space-y-3 text-sm leading-7 text-[#B8C2D6] sm:text-base sm:leading-8">
            <p>
              My name is Asadbek Olimov, and many of my students know me by my nickname, Mr. Max. I have been
              working as an English teacher for over 5 years.
            </p>
            <p>
              I have helped more than 1,000 successful students improve their English skills and achieve strong
              CEFR results. Currently, I work at THOMPSON SCHOOL and teach both offline and online.
            </p>
            <p>
              My strongest ability is helping absolute beginners grow into confident English speakers with the
              right methodology, motivation, and support.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="https://t.me/itisteacher_max"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#004D98] to-[#A50044] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#004D98]/25 transition-opacity hover:opacity-90"
            >
              Contact Me
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/#services"
              className="rounded-full border-2 border-[#EDBB00]/40 px-6 py-2.5 text-sm font-semibold text-[#EDBB00] transition-all hover:bg-[#EDBB00] hover:text-[#050914]"
            >
              Start Learning
            </Link>
          </div>

          {/* Contact items */}
          <div className="mt-6 flex flex-col gap-3">
            {contacts.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 text-sm font-medium text-[#E5E7EB] transition-colors hover:text-[#EDBB00]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDBB00]/10 text-[#EDBB00]">
                    <Icon className="h-4 w-4" />
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>
          <div></div>

          {/* Social icons */}
          <div className="mt-5 flex gap-3">
            {[
              { href: 'https://t.me/@max_teacher', Icon: MessageCircle },
              { href: 'mailto:olimovmax2003@gmail.com', Icon: Mail },
              { href: 'tel:+998900406728', Icon: Phone },
            ].map(({ href, Icon }) => (
              <a
                key={href}
                href={href}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#004D98] to-[#A50044] text-[#EDBB00] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#004D98]/25"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
