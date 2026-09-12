import React from 'react';
import { useStays } from '../../context/StaysContext';
import { StaysLanding } from './StaysLanding';
import { HotelResults } from './HotelResults';
import { HotelDetails } from './HotelDetails';
import { GuestDetailsForm } from './GuestDetailsForm';
import { SecurePayment } from './SecurePayment';
import { BookingConfirmation } from './BookingConfirmation';
import { MyBookingsPortal } from './MyBookingsPortal';

export function StaysExperience({ onBackToHome, onNavigateToTrip }) {
  const { activeStage, navigateToStage } = useStays();

  const renderStageContent = () => {
    switch (activeStage) {
      case 'landing':
        return <StaysLanding />;
      case 'results':
        return <HotelResults />;
      case 'details':
        return <HotelDetails />;
      case 'guest':
        return <GuestDetailsForm />;
      case 'payment':
        return <SecurePayment />;
      case 'confirmation':
        return <BookingConfirmation onNavigateToTrip={onNavigateToTrip} />;
      case 'my-bookings':
        return <MyBookingsPortal />;
      default:
        return <StaysLanding />;
    }
  };

  return (
    <div className="w-full">
      {renderStageContent()}
    </div>
  );
}

export default StaysExperience;
