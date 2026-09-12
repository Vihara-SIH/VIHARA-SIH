import React from 'react';
import { StaysExperience } from '../stays/StaysExperience';

export function StaysAndTravel({ onBack, onNavigateToTrip }) {
  return (
    <div className="w-full">
      <StaysExperience onBackToHome={onBack} onNavigateToTrip={onNavigateToTrip} />
    </div>
  );
}

export default StaysAndTravel;
