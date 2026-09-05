import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export function CategoryCard({ category }) {
  const { toggleSubcategory, isSubcategorySelected, selectedCategories } = useTrip();
  const [isExpanded, setIsExpanded] = useState(true);

  const selectedInThisCategory = selectedCategories[category.id] || [];

  return (
    <div className={`vihara-category-card ${!isExpanded ? 'collapsed' : ''}`}>
      {/* Category Header with Script Font & Expand Arrow */}
      <div
        className="vihara-category-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <span className="vihara-category-title">
          {category.title}
        </span>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {selectedInThisCategory.length > 0 && (
            <span className="vihara-cat-badge">
              {selectedInThisCategory.length}
            </span>
          )}
          <ChevronDown
            size={22}
            className={`vihara-chevron-icon ${isExpanded ? '' : 'rotated'}`}
          />
        </div>
      </div>

      {/* Expandable Subcategories with Checkboxes */}
      {isExpanded && (
        <div className="vihara-category-body">
          {category.subcategories.map((sub) => {
            const isChecked = isSubcategorySelected(category.id, sub.label);
            return (
              <div
                key={sub.id}
                className={`vihara-subcategory-item ${isChecked ? 'checked' : ''}`}
                onClick={() => toggleSubcategory(category.id, sub.label)}
                role="checkbox"
                aria-checked={isChecked}
              >
                <div className={`vihara-checkbox ${isChecked ? 'checked' : ''}`}>
                  {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </div>
                <span>{sub.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategoryCard;
