import { Listing, ListingType } from '@/types';

/**
 * Returns an HTML element for a MapLibre marker adhering to the strict 3-color shape system.
 */
export function createCustomMarkerElement(
  listing: Listing,
  isSelected: boolean,
  onClick: () => void
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'custom-map-pin cursor-pointer select-none transition-transform duration-200';
  el.style.transformOrigin = 'center center';
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  el.setAttribute('aria-label', `${listing.name} (${listing.type})`);

  const isFeatured = listing.is_featured;
  const isHiring = (listing.jobs_count || 0) > 0;
  const size = isFeatured ? 36 : 28;
  const halfSize = size / 2;

  // Pulse wrapper for Hiring
  if (isHiring) {
    el.classList.add('pulse-hiring');
    el.style.borderRadius = '9999px';
  }

  // Hover and selection scaling
  el.onmouseenter = () => {
    el.style.transform = 'scale(1.22)';
    el.style.zIndex = '50';
  };
  el.onmouseleave = () => {
    el.style.transform = isSelected ? 'scale(1.15)' : 'scale(1)';
    el.style.zIndex = isSelected ? '40' : '10';
  };
  el.onclick = (e) => {
    e.stopPropagation();
    onClick();
  };
  el.onkeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  if (isSelected) {
    el.style.transform = 'scale(1.15)';
    el.style.zIndex = '40';
  }

  let svgContent = '';

  const doubleRing = isFeatured
    ? `<circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - 1.5}" fill="none" stroke="#EAAA00" stroke-width="1.5" stroke-dasharray="3 2"/>`
    : '';

  switch (listing.type) {
    case 'startup':
      // Marigold filled circle with 2px aubergine ring
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${doubleRing}
          <circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - (isFeatured ? 5 : 3)}" fill="#EAAA00" stroke="#3A0F34" stroke-width="2"/>
        </svg>
      `;
      break;

    case 'investor':
      // Aubergine filled diamond
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${doubleRing}
          <polygon points="${halfSize},${isFeatured ? 5 : 3} ${size - (isFeatured ? 5 : 3)},${halfSize} ${halfSize},${size - (isFeatured ? 5 : 3)} ${isFeatured ? 5 : 3},${halfSize}" fill="#3A0F34" stroke="#DDE3E8" stroke-width="1"/>
        </svg>
      `;
      break;

    case 'incubator':
      // Aubergine ring (hollow circle) with a marigold dot in the center
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${doubleRing}
          <circle cx="${halfSize}" cy="${halfSize}" r="${halfSize - (isFeatured ? 5 : 3)}" fill="#DDE3E8" stroke="#3A0F34" stroke-width="2.5"/>
          <circle cx="${halfSize}" cy="${halfSize}" r="${isFeatured ? 4 : 3}" fill="#EAAA00"/>
        </svg>
      `;
      break;

    case 'campus':
      // Aubergine filled square with a silver dot
      const sqOffset = isFeatured ? 6 : 4;
      const sqDim = size - sqOffset * 2;
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${doubleRing}
          <rect x="${sqOffset}" y="${sqOffset}" width="${sqDim}" height="${sqDim}" rx="2.5" fill="#3A0F34"/>
          <circle cx="${halfSize}" cy="${halfSize}" r="${isFeatured ? 3 : 2.5}" fill="#DDE3E8"/>
        </svg>
      `;
      break;

    case 'coworking':
      // Marigold filled triangle with an aubergine ring
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${doubleRing}
          <polygon points="${halfSize},${isFeatured ? 5 : 3} ${size - (isFeatured ? 5 : 3)},${size - (isFeatured ? 5 : 3)} ${isFeatured ? 5 : 3},${size - (isFeatured ? 5 : 3)}" fill="#EAAA00" stroke="#3A0F34" stroke-width="2"/>
        </svg>
      `;
      break;

    default:
      svgContent = `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${halfSize}" cy="${halfSize}" r="8" fill="#EAAA00" stroke="#3A0F34" stroke-width="2"/>
        </svg>
      `;
  }

  el.innerHTML = svgContent;
  return el;
}
