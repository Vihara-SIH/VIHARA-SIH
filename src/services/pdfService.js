import { jsPDF } from 'jspdf';

/**
 * Generates an actual, complete, non-empty PDF Blob from the generated itinerary data.
 * Reuses the exact same visual structure, hierarchy, and content as the VIHARA Travel Dossier
 * (Cover Brochure, Origin Badge, Route Ribbon, Day-by-Day Activities, Timings, Visiting Hours, Entry Info, Tips).
 *
 * @param {Object} tripData - Complete trip parameters and generated itinerary data
 * @returns {Promise<Blob>} A Promise resolving to a valid application/pdf Blob
 */
export const generateItineraryPDFBlob = async (tripData = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const {
        tripTitle = 'VIHARA Heritage Odyssey',
        currentLocation = 'Hyderabad',
        destinations = ['hyderabad'],
        destinationOrder = destinations,
        startDate = '',
        endDate = '',
        numberOfDays = 1,
        numberOfTravelers = 1,
        travelType = 'solo',
        generatedItinerary = []
      } = tripData;

      const activeDestinations = Array.isArray(destinationOrder) && destinationOrder.length > 0
        ? destinationOrder
        : (Array.isArray(destinations) && destinations.length > 0 ? destinations : ['hyderabad']);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      // Safe clean text helper (removes emojis and converts non-ASCII characters for standard PDF fonts)
      const cleanText = (text) => {
        if (!text) return '';
        return String(text)
          .replace(/₹/g, 'Rs. ')
          .replace(/➔|➜|➝|→/g, '->')
          .replace(/[•●]/g, '-')
          .replace(/⏰|🕒|⏳|⏱️/g, '')
          .replace(/🎟️|🎫/g, '')
          .replace(/💡|✨|☀️|💧|📍|👥|📅|🙏/g, '')
          .replace(/[^\x00-\x7F]/g, '') // strip any other multi-byte emoji/unicode characters
          .replace(/\s+/g, ' ')
          .trim();
      };

      // =========================================================================
      // PAGE 1: COVER BROCHURE (Styled after VIHARA Travel Dossier Page 1)
      // =========================================================================

      // Outer Card Frame
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 10, 10, 'FD');

      // Hero Cover Banner (Deep Navy #0d1c32)
      doc.setFillColor(13, 28, 50);
      doc.roundedRect(margin + 16, margin + 16, contentWidth - 32, 160, 8, 8, 'F');

      // Gold Badge: CURATED JOURNEY • ORIGIN
      doc.setFillColor(212, 175, 55);
      const originBadgeText = `CURATED JOURNEY | ${cleanText(currentLocation).toUpperCase()} ORIGIN`;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      const badgeWidth = doc.getTextWidth(originBadgeText) + 20;
      doc.roundedRect(margin + 32, margin + 32, Math.min(badgeWidth, contentWidth - 80), 18, 9, 9, 'F');
      doc.setTextColor(13, 28, 50);
      doc.text(originBadgeText, margin + 42, margin + 44);

      // Main Trip Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(21);
      const titleText = cleanText(tripTitle).toUpperCase();
      const splitTitle = doc.splitTextToSize(titleText, contentWidth - 80);
      doc.text(splitTitle, margin + 32, margin + 80);

      // Subtitle (Duration & Destinations Ribbon)
      const destString = activeDestinations
        .map((d) => cleanText(typeof d === 'object' ? (d.name || d.id || '') : d).toUpperCase())
        .join(' ~ ');
      const destSub = `${numberOfDays}D / ${Math.max(1, numberOfDays - 1)}N | ${destString}`;
      doc.setTextColor(254, 214, 91);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.text(destSub, margin + 32, margin + 140);

      // Route Summary Ribbon Box (#fafaf5 with dashed gold border)
      const ribbonY = margin + 195;
      doc.setFillColor(250, 250, 245);
      doc.setDrawColor(212, 175, 55);
      doc.setLineDashPattern([3, 3], 0);
      doc.roundedRect(margin + 16, ribbonY, contentWidth - 32, 42, 6, 6, 'FD');
      doc.setLineDashPattern([], 0);

      doc.setTextColor(13, 28, 50);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      const routeText = `Origin: ${cleanText(currentLocation)}   ->   ${activeDestinations.map((d) => cleanText(typeof d === 'object' ? (d.name || d.id || '') : d).toUpperCase()).join(' -> ')}   ->   ${numberOfTravelers} Travelers (${cleanText(travelType)})`;
      const splitRoute = doc.splitTextToSize(routeText, contentWidth - 50);
      doc.text(splitRoute, margin + 28, ribbonY + 24);

      // About This Journey Section
      const aboutY = ribbonY + 60;
      doc.setTextColor(115, 92, 0); // Gold Dark #735c00
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('ABOUT THIS JOURNEY', margin + 20, aboutY);

      doc.setTextColor(55, 65, 81);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const destNames = activeDestinations
        .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
        .join(' and ');
      const aboutPara = `Welcome to your personalized ${cleanText(tripTitle)}. Spanning ${numberOfDays} days, this itinerary takes you through the most iconic monuments, sacred heritage sanctums, authentic culinary tasting circuits, and serene sunset viewpoints across ${destNames}. Every scheduled experience is tailored for ${cleanText(travelType)} travelers with curated visiting hours, ticket info, and expert local tips.`;
      const splitAbout = doc.splitTextToSize(aboutPara, contentWidth - 40);
      doc.text(splitAbout, margin + 20, aboutY + 18);

      // Journey At a Glance Matrix Box
      const matrixY = aboutY + 115;
      doc.setFillColor(250, 250, 245);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + 16, matrixY, contentWidth - 32, 105, 6, 6, 'FD');

      doc.setTextColor(13, 28, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('JOURNEY AT A GLANCE', margin + 30, matrixY + 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(`* Total Duration: ${numberOfDays} Days (${cleanText(startDate)} to ${cleanText(endDate)})`, margin + 30, matrixY + 44);
      doc.text(`* Primary Destinations: ${activeDestinations.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`, margin + 30, matrixY + 64);
      doc.text(`* Traveling Party: ${numberOfTravelers} Travelers (${cleanText(travelType)})`, margin + 30, matrixY + 84);

      // Cover Page Footer
      const footerY = pageHeight - margin - 25;
      doc.setDrawColor(229, 231, 235);
      doc.line(margin + 16, footerY, pageWidth - margin - 16, footerY);

      doc.setTextColor(13, 28, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('VIHARA Smart Tourism | Digital Concierge', margin + 20, footerY + 16);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Travel Dates: ${cleanText(startDate)} to ${cleanText(endDate)}`, pageWidth - margin - 175, footerY + 16);

      // =========================================================================
      // PAGE 2+: DAY-BY-DAY ITINERARY & PLACES ONLY (Clean, unmingled)
      // =========================================================================
      doc.addPage();

      const renderPageHeader = () => {
        // Outer border
        doc.setDrawColor(229, 231, 235);
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 10, 10, 'FD');

        // Section Header
        doc.setTextColor(13, 28, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text('Day-by-Day Journey & Places', margin + 20, margin + 28);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('Complete scheduled visits, visiting hours, and travel highlights', margin + 20, margin + 42);

        // Days badge pill
        doc.setFillColor(254, 214, 91);
        doc.roundedRect(pageWidth - margin - 110, margin + 18, 90, 20, 10, 10, 'F');
        doc.setTextColor(115, 92, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text(`${numberOfDays} DAYS TOTAL`, pageWidth - margin - 98, margin + 31);

        doc.setDrawColor(229, 231, 235);
        doc.line(margin + 16, margin + 54, pageWidth - margin - 16, margin + 54);

        return margin + 70;
      };

      let currentY = renderPageHeader();

      generatedItinerary.forEach((day) => {
        // Check if we need a new page for Day Header
        if (currentY > pageHeight - margin - 150) {
          doc.addPage();
          currentY = renderPageHeader();
        }

        // Day Header Box (#fafaf5)
        doc.setFillColor(250, 250, 245);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(margin + 16, currentY, contentWidth - 32, 28, 5, 5, 'FD');

        // Day Number Circle (#0d1c32)
        doc.setFillColor(13, 28, 50);
        doc.circle(margin + 32, currentY + 14, 9, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        const dayNumStr = String(day.dayNumber);
        doc.text(dayNumStr, margin + (dayNumStr.length > 1 ? 27 : 29.5), currentY + 17);

        // Day Title
        doc.setTextColor(13, 28, 50);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(`Day 0${day.dayNumber}: ${cleanText(day.city)} Exploration`, margin + 48, currentY + 14);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(107, 114, 128);
        doc.text(`${cleanText(day.date)} | ${cleanText(day.state)}`, margin + 48, currentY + 24);

        // Weather Badge
        if (day.weather) {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(pageWidth - margin - 165, currentY + 5, 140, 18, 9, 9, 'FD');
          doc.setTextColor(13, 28, 50);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`Weather: ${cleanText(day.weather.temp)} (${cleanText(day.weather.condition)})`, pageWidth - margin - 158, currentY + 17);
        }

        currentY += 36;

        // Activities List
        (day.activities || []).forEach((act) => {
          const splitDesc = doc.splitTextToSize(cleanText(act.description), contentWidth - 60);
          const actHeight = 42 + splitDesc.length * 10;

          if (currentY + actHeight > pageHeight - margin - 45) {
            doc.addPage();
            currentY = renderPageHeader();
          }

          // Activity Divider Line
          doc.setDrawColor(243, 244, 246);
          doc.line(margin + 20, currentY, pageWidth - margin - 20, currentY);
          currentY += 10;

          // Time & Slot Badge
          doc.setTextColor(115, 92, 0); // Gold Dark
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`TIME: ${cleanText(act.time)} | ${cleanText(act.slotType)}`.toUpperCase(), margin + 24, currentY);
          currentY += 13;

          // Activity Title
          doc.setTextColor(13, 28, 50);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10.5);
          doc.text(cleanText(act.title), margin + 24, currentY);
          currentY += 13;

          // Activity Description
          doc.setTextColor(75, 85, 99);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.text(splitDesc, margin + 24, currentY);
          currentY += splitDesc.length * 10 + 4;

          // Metadata Details (Hours, Entry, Tip)
          doc.setTextColor(107, 114, 128);
          doc.setFontSize(7.5);
          const metaItems = [];
          if (act.visitingHours) metaItems.push(`Hours: ${cleanText(act.visitingHours)}`);
          if (act.entryInfo) metaItems.push(`Entry: ${cleanText(act.entryInfo)}`);
          if (act.travelTip) metaItems.push(`Tip: ${cleanText(act.travelTip)}`);
          if (metaItems.length > 0) {
            const metaStr = doc.splitTextToSize(metaItems.join('   |   '), contentWidth - 60);
            doc.text(metaStr, margin + 24, currentY);
            currentY += metaStr.length * 9 + 4;
          }

          currentY += 6;
        });

        currentY += 14;
      });

      // End of Dossier Notes Box
      if (currentY > pageHeight - margin - 50) {
        doc.addPage();
        currentY = renderPageHeader();
      }

      doc.setFillColor(250, 250, 245);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + 16, currentY, contentWidth - 32, 26, 6, 6, 'FD');

      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('* Generated exclusively for you by VIHARA AI Concierge.', margin + 26, currentY + 16);

      doc.setTextColor(13, 28, 50);
      doc.setFont('helvetica', 'bold');
      doc.text('Safe & Memorable Travels!', pageWidth - margin - 150, currentY + 16);

      // Produce application/pdf Blob
      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    } catch (error) {
      console.error('Error generating itinerary PDF Blob:', error);
      reject(error);
    }
  });
};

/**
 * Generates an official, branded PDF Reservation Voucher for a hotel booking
 *
 * @param {Object} booking - Complete booking details object
 * @returns {Promise<Blob>} A Promise resolving to a valid application/pdf Blob
 */
export const generateBookingVoucherPDFBlob = async (booking = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 36;
      const contentWidth = pageWidth - margin * 2;

      const cleanText = (text) => {
        if (!text) return '';
        return String(text)
          .replace(/₹/g, 'Rs. ')
          .replace(/[•●]/g, '-')
          .replace(/[^\x00-\x7F]/g, '')
          .trim();
      };

      // Outer Frame
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(252, 249, 241);
      doc.roundedRect(margin, margin, contentWidth, pageHeight - margin * 2, 12, 12, 'FD');

      // Top Navy Header
      doc.setFillColor(13, 28, 50);
      doc.roundedRect(margin + 16, margin + 16, contentWidth - 32, 90, 8, 8, 'F');

      // Brand Title
      doc.setTextColor(212, 175, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('VIHARA STAYS | OFFICIAL SANCTUARY RESERVATION VOUCHER', margin + 32, margin + 40);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(cleanText(booking.hotel?.name || 'Sanctuary Retreat'), margin + 32, margin + 65);

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(cleanText(booking.hotel?.location || 'India'), margin + 32, margin + 82);

      // Reference Badge Box
      const badgeY = margin + 120;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(212, 175, 55);
      doc.roundedRect(margin + 16, badgeY, contentWidth - 32, 45, 6, 6, 'FD');

      doc.setTextColor(115, 92, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('BOOKING REFERENCE', margin + 32, badgeY + 18);

      doc.setTextColor(180, 83, 9);
      doc.setFontSize(14);
      doc.text(cleanText(booking.bookingId || 'VIH-RES-000000'), margin + 32, badgeY + 35);

      doc.setTextColor(16, 185, 129);
      doc.setFontSize(9);
      doc.text('CONFIRMED & GUARANTEED', pageWidth - margin - 170, badgeY + 28);

      // Stay Details Grid Box
      const gridY = badgeY + 60;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + 16, gridY, contentWidth - 32, 120, 6, 6, 'FD');

      doc.setTextColor(13, 28, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RESERVATION & SCHEDULE DETAILS', margin + 32, gridY + 24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);

      doc.text(`* Check-In Date: ${cleanText(booking.checkIn)} (From 2:00 PM)`, margin + 32, gridY + 45);
      doc.text(`* Check-Out Date: ${cleanText(booking.checkOut)} (Until 11:00 AM)`, margin + 32, gridY + 65);
      doc.text(`* Duration: ${booking.nights || 1} Nights`, margin + 32, gridY + 85);
      doc.text(`* Reserved Suite: ${cleanText(booking.room?.name || 'Deluxe Suite')}`, margin + 32, gridY + 105);

      doc.text(`* Lead Guest: ${cleanText(booking.guestDetails?.fullName || 'Traveler')}`, margin + 280, gridY + 45);
      doc.text(`* Email: ${cleanText(booking.guestDetails?.email || 'N/A')}`, margin + 280, gridY + 65);
      doc.text(`* Occupancy: ${booking.guests || 2} Guests (${booking.rooms || 1} Room)`, margin + 280, gridY + 85);
      doc.text(`* Inclusions: ${cleanText(booking.room?.mealPlan || 'Breakfast Included')}`, margin + 280, gridY + 105);

      // Tariff Breakdown Box
      const tariffY = gridY + 135;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + 16, tariffY, contentWidth - 32, 140, 6, 6, 'FD');

      doc.setTextColor(13, 28, 50);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('PAYMENT & ITEMIZED TARIFF SUMMARY', margin + 32, tariffY + 24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(75, 85, 99);

      const pricing = booking.pricing || {};
      doc.text(`Nightly Suite Rate (${booking.nights || 1} Nights):`, margin + 32, tariffY + 48);
      doc.text(`Rs. ${(pricing.baseTariff || 0).toLocaleString()}`, pageWidth - margin - 100, tariffY + 48);

      doc.text('Heritage Conservation Cess (8%):', margin + 32, tariffY + 68);
      doc.text(`Rs. ${(pricing.heritageCess || 0).toLocaleString()}`, pageWidth - margin - 100, tariffY + 68);

      doc.text('Goods & Services Tax (18% GST):', margin + 32, tariffY + 88);
      doc.text(`Rs. ${(pricing.gst || 0).toLocaleString()}`, pageWidth - margin - 100, tariffY + 88);

      if (pricing.memberDiscount > 0) {
        doc.text('VIHARA Privilege Member Benefit:', margin + 32, tariffY + 108);
        doc.text(`-Rs. ${pricing.memberDiscount.toLocaleString()}`, pageWidth - margin - 100, tariffY + 108);
      }

      doc.setDrawColor(229, 231, 235);
      doc.line(margin + 32, tariffY + 115, pageWidth - margin - 32, tariffY + 115);

      doc.setTextColor(180, 83, 9);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TOTAL AMOUNT PAID:', margin + 32, tariffY + 130);
      doc.text(`Rs. ${(pricing.totalAmount || 0).toLocaleString()} (PAID)`, pageWidth - margin - 120, tariffY + 130);

      // Terms & Concierge Box
      const termsY = tariffY + 155;
      doc.setFillColor(250, 250, 245);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(margin + 16, termsY, contentWidth - 32, 90, 6, 6, 'FD');

      doc.setTextColor(115, 92, 0);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('IMPORTANT CHECK-IN POLICIES & CONCIERGE', margin + 32, termsY + 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(75, 85, 99);
      doc.text('* Please present a government-issued photo ID upon arrival at the palace reception.', margin + 32, termsY + 36);
      doc.text(`* Cancellation Policy: ${cleanText(booking.room?.cancellationPolicy || 'Free cancellation until 24h before check-in.')}`, margin + 32, termsY + 52);
      doc.text('* 24/7 Palace Concierge Direct Line: +91 800-VIHARA (800-844272) | concierge@vihara.travel', margin + 32, termsY + 68);

      // Footer
      const footerY = pageHeight - margin - 20;
      doc.setTextColor(107, 114, 128);
      doc.setFontSize(8);
      doc.text('VIHARA Smart Heritage Tourism | Digitally Verified Voucher', margin + 20, footerY);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - margin - 140, footerY);

      const pdfBlob = doc.output('blob');
      resolve(pdfBlob);
    } catch (error) {
      console.error('Error generating booking voucher PDF:', error);
      reject(error);
    }
  });
};

