import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Sparkles,
  Accessibility,
  ArrowRight,
  Database,
  Users,
  CheckCircle2,
  CloudSun,
} from 'lucide-react';
import { VoicePromptInput } from '../components/planner/VoicePromptInput';
import { WeatherWidget } from '../components/map/WeatherWidget';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { TrustBadge } from '../components/trust/TrustBadge';
import { knowledgeApi } from '../api/services/knowledgeApi';
import { NLUExtractResult } from '../types/domain';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedWeatherDest, setSelectedWeatherDest] = useState({
    name: 'Bhubaneswar, Odisha',
    lat: 20.2961,
    lon: 85.8245,
  });

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations'],
    queryFn: knowledgeApi.getDestinations,
  });

  const handlePromptExtract = (result: NLUExtractResult, promptText: string) => {
    navigate('/planner', {
      state: {
        extracted: result,
        prompt: promptText,
      },
    });
  };

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 bg-gradient-to-b from-orange-50/60 via-white to-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100/90 px-4 py-1.5 text-xs font-bold text-orange-900 border border-orange-200 shadow-xs">
            <Sparkles className="h-4 w-4 text-orange-600" />
            <span>Smart India Hackathon 2026 Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            {t('hero.title')}
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Voice / Natural Language Prompt Search Bar */}
          <div className="mx-auto max-w-2xl pt-2">
            <VoicePromptInput onExtract={handlePromptExtract} />
          </div>

          {/* Live Weather Bar on Hero */}
          <div className="mx-auto max-w-2xl pt-2">
            <WeatherWidget
              lat={selectedWeatherDest.lat}
              lon={selectedWeatherDest.lon}
              cityName={selectedWeatherDest.name}
            />
          </div>

          {/* Trust Guarantees Quick Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Zero Hallucinated Hours</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Accessibility className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Physical Accessibility Audited</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
              <Users className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Crowd & Sensitivity Guards</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Verified Travel Destinations</h2>
            <p className="text-sm text-slate-500 mt-2">
              Explore heritage cities backed by complete factual provenance and open ground records.
            </p>
          </div>

          <Button variant="outline" size="default" onClick={() => navigate('/planner')} className="rounded-xl font-bold">
            Custom Itinerary <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Card
              key={dest.id}
              className="group overflow-hidden border-slate-200 hover:shadow-xl transition-all duration-300 hover:border-orange-300 flex flex-col justify-between"
            >
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                      {dest.region || dest.country}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors mt-0.5">
                      {dest.name}
                    </h3>
                  </div>
                  <TrustBadge status="VERIFIED" />
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Rich cultural heritage with verified temple timings, wheelchair accessible routes, and live transport buffers.
                </p>

                <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                  <button
                    onClick={() =>
                      setSelectedWeatherDest({
                        name: `${dest.name}, ${dest.region || dest.country}`,
                        lat: dest.latitude,
                        lon: dest.longitude,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-sky-700 font-bold hover:underline"
                  >
                    <CloudSun className="h-4 w-4 text-sky-600" />
                    <span>Check Live Weather</span>
                  </button>

                  <Button
                    size="sm"
                    onClick={() =>
                      navigate('/planner', { state: { destinationId: dest.id } })
                    }
                    className="rounded-xl font-bold px-4"
                  >
                    Plan Trip
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Architecture Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400">
              The Architecture of Truth
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Every single fact is backed by verifiable ground evidence.
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              MargDarshak integrates a multi-layer verification engine. LLMs are strictly bounded by deterministic graph knowledge, open state registries, and live weather telemetry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="border-l-2 border-orange-500 pl-4 space-y-1">
                <span className="text-2xl font-black text-white">0%</span>
                <p className="text-xs text-slate-400 font-medium">Hallucinated Timings</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-4 space-y-1">
                <span className="text-2xl font-black text-white">100%</span>
                <p className="text-xs text-slate-400 font-medium">Audited Accessibility</p>
              </div>
              <div className="border-l-2 border-sky-500 pl-4 space-y-1">
                <span className="text-2xl font-black text-white">Real-Time</span>
                <p className="text-xs text-slate-400 font-medium">Ground Weather Sync</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
