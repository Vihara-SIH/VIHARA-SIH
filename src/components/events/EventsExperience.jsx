import React from 'react';
import { useEvents } from '../../context/EventsContext';
import { EventsDiscoveryLanding } from './EventsDiscoveryLanding';
import { EventSearchResults } from './EventSearchResults';
import { EventDetails } from './EventDetails';
import { EventTicketSelection } from './EventTicketSelection';
import { EventPaymentAndConfirmation } from './EventPaymentAndConfirmation';
import { MyEventsPortal } from './MyEventsPortal';

export function EventsExperience({ onBackToHome, onNavigateToTrip }) {
  const { activeStage, setActiveStage, toastMessage } = useEvents();

  const renderStageContent = () => {
    switch (activeStage) {
      case 'discovery':
        return <EventsDiscoveryLanding onBackToHome={onBackToHome} onNavigateToTrip={onNavigateToTrip} />;
      case 'results':
        return <EventSearchResults onBack={() => setActiveStage('discovery')} />;
      case 'details':
        return <EventDetails onBack={() => setActiveStage('results')} />;
      case 'tickets':
        return <EventTicketSelection onBack={() => setActiveStage('details')} />;
      case 'payment':
      case 'confirmation':
        return (
          <EventPaymentAndConfirmation
            onBack={() => setActiveStage('tickets')}
            onNavigateToTrip={onNavigateToTrip}
          />
        );
      case 'my-events':
        return <MyEventsPortal onBackToExplore={() => setActiveStage('discovery')} />;
      default:
        return <EventsDiscoveryLanding onBackToHome={onBackToHome} onNavigateToTrip={onNavigateToTrip} />;
    }
  };

  return (
    <div className="w-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1e1b19] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-white/10">
          <span className="material-symbols-outlined text-[#9cf2e8] text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {renderStageContent()}
    </div>
  );
}

export default EventsExperience;
