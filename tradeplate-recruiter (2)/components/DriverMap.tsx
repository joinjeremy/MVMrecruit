import React, { useEffect, useRef, useCallback } from 'react';
import { Candidate, CandidateStatus } from '../types';
import { getCoordinates } from '../services/geocodingService';

interface DriverMapProps {
  candidates: Candidate[];
}

const DriverMap: React.FC<DriverMapProps> = ({ candidates }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const createIcon = (color: string) => {
    // @ts-ignore
    if (!window.L) return null;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
    // @ts-ignore
    return window.L.divIcon({
      className: 'custom-marker',
      html: `<div style="width: 30px; height: 30px; filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.3)); cursor: pointer;">${svg}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -32]
    });
  };

  const plotCandidates = useCallback(async () => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    for (const candidate of candidates) {
      const isActive = candidate.status === CandidateStatus.HIRED;
      const isProspective = candidate.status === CandidateStatus.NEW || candidate.status === CandidateStatus.SCREENING;
      
      if (!isActive && !isProspective) continue;

      try {
        const coords = await getCoordinates(candidate);
        if (coords) {
          const color = isActive ? '#0F3B25' : '#C5A059';
          const icon = createIcon(color);
          if (icon) {
            // @ts-ignore
            const marker = window.L.marker([coords.lat, coords.lng], { icon })
              .addTo(mapInstance.current)
              .bindPopup(`<div class="font-sans"><h3 class="font-bold text-brand-dark uppercase tracking-wide">${candidate.name}</h3><p class="text-xs" style="color: ${color};">${candidate.status}</p></div>`);
            markersRef.current.push(marker);
          }
        }
      } catch (error) {
        console.warn(`Could not geocode location for ${candidate.name}:`, error);
      }
    }
  }, [candidates]);

  useEffect(() => {
    // @ts-ignore
    if (typeof window.L === 'undefined' || !mapRef.current) return;

    if (!mapInstance.current) {
      // @ts-ignore
      mapInstance.current = window.L.map(mapRef.current).setView([54.0, -2.0], 6);
      // @ts-ignore
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(mapInstance.current);
    }

    plotCandidates();

  }, [plotCandidates]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider">Logistics Map</h2>
          <p className="text-xs text-gray-500 font-serif italic mt-1">Fleet disposition and recruitment pipeline.</p>
        </div>
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-brand-green"></div><span className="text-xs font-bold uppercase tracking-widest text-brand-dark">Active Fleet</span></div>
          <div className="flex items-center space-x-2"><div className="w-3 h-3 rounded-full bg-brand-gold"></div><span className="text-xs font-bold uppercase tracking-widest text-brand-dark">Pipeline</span></div>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-sm border border-gray-200 shadow-sm relative overflow-hidden p-1">
        <div ref={mapRef} className="w-full h-full bg-gray-100 z-0" />
      </div>
    </div>
  );
};

export default DriverMap;