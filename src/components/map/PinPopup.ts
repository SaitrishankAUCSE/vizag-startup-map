import { Listing } from '@/types';

/**
 * Creates the editorial HTML content for MapLibre pin popups strictly in the 3-color palette.
 */
export function createPinPopupContent(listing: Listing): string {
  const initial = (listing.name || 'V').charAt(0).toUpperCase();
  const isHiring = (listing.jobs_count || 0) > 0;

  return `
    <div class="pin-popup-card font-sans bg-[#DDE3E8] text-[#3A0F34] p-4 w-[280px] sm:w-[310px] select-none text-left">
      <div class="flex items-start gap-3">
        <!-- Logo placeholder: Initial letter in an aubergine circle -->
        <div class="w-10 h-10 rounded-full border border-[#3A0F34] bg-[#3A0F34] text-[#DDE3E8] flex items-center justify-center font-display font-extrabold text-base shrink-0">
          ${initial}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h4 class="font-display font-extrabold text-[17px] leading-tight text-[#3A0F34] truncate">
              ${listing.name}
            </h4>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="micro-label text-[9px] text-[#3A0F34]/70">${listing.area}</span>
            <span class="text-[9px] text-[#3A0F34]/40">•</span>
            <span class="micro-label text-[9px] text-[#3A0F34]/70">${listing.sector || listing.type}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="mt-2.5 text-[12px] leading-relaxed text-[#3A0F34]/85 line-clamp-2">
        ${listing.description}
      </p>

      <!-- Meta pills (Stage, Hiring) -->
      <div class="mt-3 flex flex-wrap items-center gap-1.5">
        ${
          listing.stage
            ? `<span class="px-2 py-0.5 rounded-full border border-[#3A0F34]/25 text-[10px] font-semibold uppercase tracking-wider text-[#3A0F34] bg-[#DDE3E8]">${listing.stage}</span>`
            : ''
        }
        ${
          isHiring
            ? `<span class="px-2 py-0.5 rounded-full bg-[#EAAA00] text-[#3A0F34] text-[10px] font-bold uppercase tracking-wider">Hiring (${listing.jobs_count})</span>`
            : ''
        }
      </div>

      <!-- View Details CTA Button -->
      <div class="mt-3.5 pt-2.5 border-t border-[#3A0F34]/15 flex items-center justify-between">
        <a 
          href="/startup/${listing.slug}" 
          class="w-full inline-flex items-center justify-center py-2 px-3 rounded-full bg-[#3A0F34] text-[#DDE3E8] hover:bg-[#EAAA00] hover:text-[#3A0F34] text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-150 text-center"
        >
          VIEW DETAILS
        </a>
      </div>
    </div>
  `;
}
