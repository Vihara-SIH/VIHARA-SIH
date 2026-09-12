import React from 'react';
import { EventsExperience } from '../events/EventsExperience';

export function EventBookings({ onBack, onNavigateToTrip }) {
  return (
    <div className="w-full">
      <EventsExperience onBackToHome={onBack} onNavigateToTrip={onNavigateToTrip} />
    </div>
  );
}

export default EventBookings;

