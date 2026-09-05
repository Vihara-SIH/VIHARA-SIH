import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { DESTINATIONS } from '../data/destinations';
import { useTrip } from '../context/TripContext';

export function DestinationDropdown() {
  const { selectedDestinations, toggleDestination, clearDestinations } = useTrip();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDestinations = DESTINATIONS.filter((dest) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDisplayText = () => {
    if (selectedDestinations.length === 0) {
      return <span className="vihara-dest-placeholder">Select a city</span>;
    }
    if (selectedDestinations.length <= 3) {
      return <span>{selectedDestinations.join(', ')}</span>;
    }
    return (
      <span>
        {selectedDestinations.slice(0, 2).join(', ')} +{selectedDestinations.length - 2} more
      </span>
    );
  };

  return (
    <div className="vihara-dest-dropdown-wrapper" ref={dropdownRef}>
      {/* Trigger Box matching Reference Image 1 */}
      <div
        className={`vihara-dest-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="vihara-dest-trigger-text">
          {getDisplayText()}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {selectedDestinations.length > 0 && (
            <span className="vihara-dest-badge-count">
              {selectedDestinations.length}
            </span>
          )}
          <ChevronDown
            size={20}
            className={`vihara-chevron-icon ${isOpen ? 'rotated' : ''}`}
          />
        </div>
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="vihara-dest-dropdown-panel" role="listbox">
          {/* Quick Search */}
          <div className="vihara-dest-search-bar">
            <Search size={16} color="#798B82" />
            <input
              type="text"
              className="vihara-dest-search-input"
              placeholder="Search city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            {selectedDestinations.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearDestinations();
                }}
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#798B82', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Destination List with Checkboxes */}
          <div className="vihara-dest-list">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((dest) => {
                const isSelected = selectedDestinations.includes(dest.name);
                return (
                  <div
                    key={dest.id}
                    className={`vihara-dest-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleDestination(dest.name)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className={`vihara-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>
                    <span>{dest.name}</span>
                    <span style={{ fontSize: '0.8rem', color: '#798B82', marginLeft: 'auto' }}>
                      {dest.state}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#798B82', fontSize: '0.9rem' }}>
                No destinations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationDropdown;
