import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTrip } from './context/TripContext';
import { StaysProvider, useStays } from './context/StaysContext';
import { Navbar } from './components/Navbar';
import { TopNotification } from './components/TopNotification';
import { AuthModal } from './components/AuthModal';
import { Homepage } from './components/Homepage';
import { TripPlanningPage1 } from './components/TripPlanningPage1';
import { TripPlanningPage2 } from './components/TripPlanningPage2';
import { BudgetPage } from './components/BudgetPage';
import { TripOverviewPage } from './components/TripOverviewPage';
import { NearMe } from './components/features/NearMe';
import { EventBookings } from './components/features/EventBookings';
import { StaysAndTravel } from './components/features/StaysAndTravel';
import { GlobalAIConcierge } from './components/GlobalAIConcierge';
import './styles/vihara-theme.css';

function MainApplication() {
  const { isAuthenticated, triggerAuthGate, pendingTargetView, setPendingTargetView } = useAuth();
  const { activeStep, setActiveStep, resetTripState } = useTrip();
  const stays = useStays();
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'trip-planning' | 'near-me' | 'event-bookings' | 'stays-travel' | 'my-bookings'

  // Auto-navigate to pending target view after successful login
  React.useEffect(() => {
    if (isAuthenticated && pendingTargetView) {
      if (pendingTargetView === 'my-bookings') {
        stays?.navigateToStage('my-bookings');
        setCurrentView('stays-travel');
      } else {
        setCurrentView(pendingTargetView);
      }
      setPendingTargetView(null);
    }
  }, [isAuthenticated, pendingTargetView]);

  const handleNavigate = (view) => {
    if (view === 'home') {
      setCurrentView('home');
      return;
    }

    // Protected Route Gate
    if (!isAuthenticated) {
      triggerAuthGate(
        view,
        `Please sign in to access ${
          view === 'trip-planning'
            ? 'Trip Planning & AI Itineraries'
            : view === 'near-me'
            ? 'Near Me Experiences'
            : view === 'event-bookings'
            ? 'Cultural Events'
            : view === 'my-bookings'
            ? 'My Bookings & Reservations'
            : 'Luxury Stays & Transit'
        }.`
      );
      return;
    }

    if (view === 'my-bookings') {
      stays?.navigateToStage('my-bookings');
      setCurrentView('stays-travel');
      return;
    }

    setCurrentView(view);
    if (view === 'trip-planning' && activeStep > 4) {
      setActiveStep(1);
    }
  };

  const handlePlanNewTrip = () => {
    resetTripState();
    setActiveStep(1);
    setCurrentView('trip-planning');
  };

  const handleBookStayForTrip = () => {
    stays?.syncWithActiveTrip();
    stays?.navigateToStage('results');
    setCurrentView('stays-travel');
  };

  const renderTripPlanningStage = () => {
    switch (activeStep) {
      case 1:
        return <TripPlanningPage1 onNext={() => setActiveStep(2)} />;
      case 2:
        return (
          <TripPlanningPage2
            onBack={() => setActiveStep(1)}
            onNext={() => setActiveStep(3)}
          />
        );
      case 3:
        return (
          <BudgetPage
            onBack={() => setActiveStep(2)}
            onComplete={() => setActiveStep(4)}
          />
        );
      case 4:
        return (
          <TripOverviewPage
            onPlanNewTrip={handlePlanNewTrip}
            onBookStay={handleBookStayForTrip}
          />
        );
      default:
        return <TripPlanningPage1 onNext={() => setActiveStep(2)} />;
    }
  };

  const renderFeatureView = () => {
    switch (currentView) {
      case 'trip-planning':
        return renderTripPlanningStage();
      case 'near-me':
        return <NearMe onBack={() => setCurrentView('home')} />;
      case 'event-bookings':
        return <EventBookings onBack={() => setCurrentView('home')} />;
      case 'stays-travel':
        return (
          <StaysAndTravel
            onBack={() => setCurrentView('home')}
            onNavigateToTrip={() => handleNavigate('trip-planning')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Top Warning/Toast Notification when Auth Gate is triggered */}
      <TopNotification />

      {/* Global Auth Modal for Sign In, Sign Up, and Password Reset */}
      <AuthModal />

      {/* Global Context-Aware AI Concierge Widget */}
      <GlobalAIConcierge currentView={currentView} />

      {currentView === 'home' ? (
        /* Full-screen Stitch Homepage */
        <Homepage onSelectFeature={handleNavigate} />
      ) : (
        /* Inner Features Layout with Consistent Vihara Theme */
        <div className="min-h-screen bg-[#fafaf5] text-[#1a1c19] flex flex-col pt-16">
          {/* Global Sticky Navigation Bar */}
          <Navbar currentView={currentView} onNavigate={handleNavigate} />

          {/* Main Content Area */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
            {renderFeatureView()}
          </main>

          {/* Heritage Footer */}
          <footer className="w-full bg-[#0d1c32] text-[#fafaf5] border-t-2 border-[#D4AF37] py-6 px-6 mt-12 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-widest" style={{ fontFamily: 'Kalam, cursive' }}>
                  VIHARA
                </span>
                <span className="text-gray-400">| Smart Heritage Tourism & AI Planner</span>
              </div>
              <p className="text-gray-400 text-center md:text-right">
                All user trips & personal itineraries are privately secured per user.
              </p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <StaysProvider>
          <MainApplication />
        </StaysProvider>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
