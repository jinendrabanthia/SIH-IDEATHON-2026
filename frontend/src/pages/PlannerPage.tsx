import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Compass, Sparkles, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { knowledgeApi } from '../api/services/knowledgeApi';
import { plannerApi } from '../api/services/plannerApi';
import { TripWizard } from '../components/planner/TripWizard';
import { ItineraryTimeline } from '../components/planner/ItineraryTimeline';
import { ExcludedStopsList } from '../components/planner/ExcludedStopsList';
import { NarrationBox } from '../components/planner/NarrationBox';
import { BudgetSummaryWidget } from '../components/planner/BudgetSummaryWidget';
import { InteractiveMap } from '../components/map/InteractiveMap';
import { WeatherWidget } from '../components/map/WeatherWidget';
import { VoicePromptInput } from '../components/planner/VoicePromptInput';
import { PlannerInput, ItineraryPlanResponse, ItineraryItem, NLUExtractResult } from '../types/domain';

export const PlannerPage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as {
    destinationId?: string;
    extracted?: NLUExtractResult;
    prompt?: string;
  } | null;

  // 1. Fetch available destinations
  const { data: destinations = [], isLoading: isLoadingDestinations } = useQuery({
    queryKey: ['destinations'],
    queryFn: knowledgeApi.getDestinations,
  });

  // 2. Planner state
  const [plannerInput, setPlannerInput] = useState<PlannerInput>({
    destinationId: '',
    startDate: new Date().toISOString(),
    days: 2,
    preferences: {
      pace: 'MODERATE',
      accessibilityWheelchair: false,
      interests: [],
      transportPreference: 'MIXED',
    },
  });

  const [selectedItineraryItem, setSelectedItineraryItem] = useState<ItineraryItem | null>(null);
  const [activeDay, setActiveDay] = useState<number | 'ALL'>(1);

  // Set default or passed destination
  useEffect(() => {
    if (destinations.length > 0) {
      const matchId =
        locationState?.destinationId ||
        (plannerInput.destinationId ? plannerInput.destinationId : destinations[0].id);

      let updatedPreferences = { ...plannerInput.preferences };
      if (locationState?.extracted) {
        updatedPreferences = {
          ...updatedPreferences,
          pace: locationState.extracted.pace || updatedPreferences.pace,
          accessibilityWheelchair:
            locationState.extracted.accessibilityWheelchair ??
            updatedPreferences.accessibilityWheelchair,
          interests: locationState.extracted.interests || updatedPreferences.interests,
          transportPreference:
            locationState.extracted.transportPreference || updatedPreferences.transportPreference,
        };
      }

      setPlannerInput((prev) => ({
        ...prev,
        destinationId: matchId,
        preferences: updatedPreferences,
      }));
    }
  }, [destinations, locationState]);

  // 3. Fetch attractions for map background
  const { data: currentAttractions = [] } = useQuery({
    queryKey: ['attractions', plannerInput.destinationId],
    queryFn: () => knowledgeApi.getAttractionsByDestination(plannerInput.destinationId),
    enabled: !!plannerInput.destinationId,
  });

  // 4. Generate Itinerary Mutation
  const generateMutation = useMutation({
    mutationFn: (input: PlannerInput) => plannerApi.generateItinerary(input),
  });

  const handleGenerate = () => {
    if (!plannerInput.destinationId) return;
    generateMutation.mutate(plannerInput);
  };

  const handleVoiceExtract = (extracted: NLUExtractResult) => {
    setPlannerInput((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        pace: extracted.pace || prev.preferences.pace,
        accessibilityWheelchair:
          extracted.accessibilityWheelchair ?? prev.preferences.accessibilityWheelchair,
        interests: extracted.interests || prev.preferences.interests,
        transportPreference:
          extracted.transportPreference || prev.preferences.transportPreference,
      },
    }));
  };

  const currentDestination = destinations.find((d) => d.id === plannerInput.destinationId);
  const planData: ItineraryPlanResponse | undefined = generateMutation.data;

  const mapCenter: [number, number] = currentDestination
    ? [currentDestination.latitude, currentDestination.longitude]
    : [20.2961, 85.8245]; // Default to Bhubaneswar

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Voice Assistant */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-orange-600">
            <Compass className="h-5 w-5" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Verified Itinerary Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build your personalized trip backed by real hours, wheelchair audits, and transparent travel times.
          </p>
        </div>

        <div className="w-full md:w-96">
          <VoicePromptInput onExtract={handleVoiceExtract} />
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Timeline & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Add-ons (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TripWizard
            destinations={destinations}
            input={plannerInput}
            onChange={setPlannerInput}
            onSubmit={handleGenerate}
            isLoading={generateMutation.isPending}
          />

          {planData && (
            <>
              <NarrationBox items={planData.itineraryItems} />
              <BudgetSummaryWidget
                items={planData.itineraryItems}
                transportMode={plannerInput.preferences.transportPreference}
              />
              <ExcludedStopsList excluded={planData.excluded} />
            </>
          )}
        </div>

        {/* Right Column: Live Map, Weather & Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Weather Indicator for Current Destination */}
          <WeatherWidget
            lat={currentDestination?.latitude ?? mapCenter[0]}
            lon={currentDestination?.longitude ?? mapCenter[1]}
            cityName={currentDestination ? `${currentDestination.name}, ${currentDestination.region || currentDestination.country}` : 'Bhubaneswar, Odisha'}
          />

          {/* Interactive Map */}
          <div className="h-[420px] w-full relative isolate z-0">
            <InteractiveMap
              center={mapCenter}
              items={planData?.itineraryItems || []}
              allAttractions={currentAttractions}
              selectedItem={selectedItineraryItem}
              activeDay={activeDay}
              onSelectDay={setActiveDay}
              onSelectAttraction={(id) => {
                const found = planData?.itineraryItems.find((i) => i.entityId === id);
                if (found) {
                  setSelectedItineraryItem(found);
                  setActiveDay(found.dayNumber);
                }
              }}
            />
          </div>

          {/* Error Message if Generation Fails */}
          {generateMutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Failed to generate itinerary</p>
                <p className="text-xs mt-0.5">
                  {(generateMutation.error as any)?.message ||
                    'No matching attractions found for these specific constraints. Try relaxing the pace or wheelchair filter.'}
                </p>
              </div>
            </div>
          )}

          {/* Day-by-Day Timeline Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">
                Itinerary Schedule
              </h3>
              {planData && (
                <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  ✓ {planData.itineraryItems.length} Verified Stops Scheduled
                </span>
              )}
            </div>

            <ItineraryTimeline
              items={planData?.itineraryItems || []}
              warnings={planData?.warnings || []}
              activeDay={activeDay}
              onSelectDay={setActiveDay}
              selectedItem={selectedItineraryItem}
              onSelectItem={(item) => {
                setSelectedItineraryItem(item);
                setActiveDay(item.dayNumber);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
