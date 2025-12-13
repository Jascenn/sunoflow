'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Music, Zap, Coins, Download, ArrowRight, Sparkles, Check, PlayCircle, Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@clerk/nextjs';
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageSwitcher } from '@/components/common/language-switcher';

export default function Home() {
  const { userId } = useAuth();
  const { t } = useLanguage();

  const examples = [
    {
      title: 'Electronic Pop',
      description: 'Upbeat electronic beats mixed with modern pop elements.',
      tags: ['Electronic', 'Pop', 'Energy'],
      emoji: '🎵',
      color: 'bg-zinc-50 text-zinc-900',
    },
    {
      title: 'Lofi Jazz',
      description: 'Smooth jazz vibes perfect for studying or relaxing.',
      tags: ['Jazz', 'Lofi', 'Chill'],
      emoji: '🎷',
      color: 'bg-zinc-50 text-zinc-900',
    },
    {
      title: 'Epic Orchestral',
      description: 'Cinematic scores that bring stories to life.',
      tags: ['Cinematic', 'Orchestral', 'Epic'],
      emoji: '🎼',
      color: 'bg-zinc-50 text-zinc-900',
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: t('features.ai_music.title'),
      description: t('features.ai_music.desc'),
      className: 'md:col-span-2 bg-gradient-to-br from-zinc-50 to-white',
    },
    {
      icon: Zap,
      title: t('features.batch.title'),
      description: t('features.batch.desc'),
      className: '',
    },
    {
      icon: Coins,
      title: t('features.credit.title'),
      description: t('features.credit.desc'),
      className: '',
    },
    {
      icon: Download,
      title: t('features.export.title'),
      description: t('features.export.desc'),
      className: '',
    },
    {
      icon: Music,
      title: t('features.lyrics.title'),
      description: t('features.lyrics.desc'),
      className: 'md:col-span-2 bg-gradient-to-br from-zinc-50 to-white',
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 selection:bg-stone-100 selection:text-black">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-black">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center relative">
              <Image src="/logo.png" alt="SunoFlow" fill className="object-cover" sizes="32px" />
            </div>
            <span>SunoFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="ghost" />
            {userId ? (
              <Link href="/dashboard" className="h-9 px-4 rounded-full bg-black text-white text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors border border-transparent shadow-sm">
                {t('nav.dashboard')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="text-sm font-medium text-stone-500 hover:text-black transition-colors hidden md:block">
                  {t('nav.login')}
                </Link>
                <Link href="/sign-up" className="h-9 px-4 rounded-full bg-black text-white text-sm font-medium flex items-center gap-2 hover:bg-stone-800 transition-colors border border-transparent shadow-sm">
                  {t('nav.get_started')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Subtle Gradient Background */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-100/50 via-white to-white pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-600 text-xs font-medium uppercase tracking-wider mb-8 shadow-sm">
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span>{t('hero.new_support')}</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05] text-black">
            {t('hero.title.part1')} <br className="hidden md:block" />
            {t('hero.title.part2')} <span className="text-stone-500 font-serif italic">{t('hero.title.ai_power')}</span>.
          </h1>

          <p className="text-xl text-stone-500 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={userId ? "/dashboard" : "/sign-up"}
              className="h-12 px-8 rounded-full bg-black text-white text-base font-medium flex items-center gap-2 hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {userId ? t('nav.dashboard') : t('hero.start_free')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="h-12 px-8 rounded-full bg-white border border-stone-200 text-stone-600 text-base font-medium flex items-center gap-2 hover:bg-stone-50 transition-all"
            >
              {t('hero.view_demo')}
              <PlayCircle className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust Badges - Monochrome */}
          <div className="mt-16 pt-8 flex flex-wrap justify-center gap-x-8 gap-y-4 border-t border-stone-100">
            {[
              { text: t('hero.trust.no_card') },
              { text: t('hero.trust.rating') },
              { text: t('hero.trust.commercial') }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-stone-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features Section (Cleaner Bento) */}
      <section id="features" className="py-24 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black">{t('features.title')}</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "group p-8 rounded-3xl bg-white border border-stone-100 hover:border-stone-200 transition-all duration-300 hover:shadow-sm",
                  feature.className
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 text-black">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-black">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples & Use Cases */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-black">{t('showcase.title')}</h2>
              <p className="text-stone-500 max-w-lg">
                {t('showcase.subtitle')}
              </p>
            </div>
            <Link href="/dashboard?filter=explore" className="text-black font-semibold hover:opacity-70 flex items-center gap-1 border-b border-black pb-0.5 leading-none">
              {t('showcase.explore')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {examples.map((ex, i) => (
              <div key={i} className="group relative rounded-2xl border border-stone-100 overflow-hidden hover:shadow-md transition-all cursor-pointer bg-white">
                <div className={cn("h-40 flex items-center justify-center text-5xl bg-stone-100")}>
                  <span className="group-hover:scale-110 transition-transform duration-300 transform drop-shadow-sm">{ex.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-black">{ex.title}</h3>
                  <p className="text-stone-500 text-sm mb-4">{ex.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {ex.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded bg-stone-50 text-stone-500 border border-stone-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof - Refined (No dark background) */}
      <section className="py-24 bg-white relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <Quote className="w-12 h-12 text-stone-200 mx-auto mb-8" />
          <h2 className="text-3xl md:text-5xl font-bold mb-10 leading-tight text-black">
            {t('testimonial.quote')}
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xl text-stone-400">
              A
            </div>
            <div className="text-left">
              <div className="font-bold text-lg text-black">{t('testimonial.name')}</div>
              <div className="text-stone-500 text-sm">{t('testimonial.role')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-black">{t('faq.title')}</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="text-lg font-bold text-black mb-2">{t(`faq.q${i}` as any)}</h3>
                <p className="text-stone-600 leading-relaxed">{t(`faq.a${i}` as any)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-black text-white text-center relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-[100px] opacity-70 pointer-events-none"></div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-stone-400 mb-10">
            {t('cta.subtitle')}
          </p>
          <Link
            href={userId ? "/dashboard" : "/sign-up"}
            className="inline-flex h-12 px-8 rounded-full bg-white text-black text-base font-bold items-center gap-2 hover:bg-stone-200 transition-all transform hover:-translate-y-1"
          >
            {userId ? t('nav.dashboard') : t('cta.btn')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-black">
            <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center relative">
              <Image src="/logo.png" alt="SunoFlow" fill className="object-cover" sizes="24px" />
            </div>
            <span>SunoFlow</span>
          </div>
          <p className="text-stone-400 text-sm">
            {t('footer.copyright')}
          </p>
          <div className="flex gap-6 text-sm text-stone-500 font-medium">
            <Link href="/terms" className="hover:text-black transition-colors">{t('footer.terms')}</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">{t('footer.privacy')}</Link>
            <a href="mailto:support@sunoflow.com" className="hover:text-black transition-colors">{t('footer.support')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
