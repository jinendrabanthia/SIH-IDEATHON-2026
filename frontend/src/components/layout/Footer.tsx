import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Database, CheckCircle2, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600 text-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">{t('app.title')}</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 pt-2">
              <CheckCircle2 className="h-4 w-4" />
              Smart India Hackathon 2026 Innovation
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Trust & Data Pillars
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-orange-600" />
                <span>Zero-Hallucination Gate</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-orange-600" />
                <span>Government & Official Data</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-orange-600" />
                <span>Crowd & Sensitivity Guards</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-orange-600" />
                <span>Multi-Language Verification</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Supported Languages
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Available in English, हिन्दी (Hindi), and ଓଡ଼ିଆ (Odia) with strict semantic preservation across translations.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 MargDarshak. Built with strict truthfulness constraints.</p>
          <div className="flex items-center gap-1 text-slate-500">
            <span>Crafted for Indian Tourism</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
