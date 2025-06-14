export const CLIMATE_PRESETS = {
  tropical: { label: "Tropical", temp: 25, solar: 1.15 },
  subtropical: { label: "Sub-tropical", temp: 22, solar: 1.05 },
  temperate: { label: "Temperate", temp: 18, solar: 0.90 },
  cool: { label: "Cool", temp: 14, solar: 0.75 }
} as const;

export type ClimateKey = keyof typeof CLIMATE_PRESETS;

// Timezone to climate mapping for auto-detection
export const TIMEZONE_CLIMATE_MAP: Record<string, ClimateKey> = {
  // Tropical zones
  'Asia/Singapore': 'tropical',
  'Asia/Bangkok': 'tropical',
  'Asia/Jakarta': 'tropical',
  'America/Manaus': 'tropical',
  'Africa/Lagos': 'tropical',
  'Pacific/Honolulu': 'tropical',
  'America/Caracas': 'tropical',
  'Asia/Kuala_Lumpur': 'tropical',
  
  // Sub-tropical zones
  'America/Miami': 'subtropical',
  'Asia/Hong_Kong': 'subtropical',
  'Australia/Brisbane': 'subtropical',
  'Africa/Cairo': 'subtropical',
  'America/Phoenix': 'subtropical',
  'Asia/Dubai': 'subtropical',
  'America/Los_Angeles': 'subtropical',
  
  // Temperate zones
  'America/New_York': 'temperate',
  'Europe/London': 'temperate',
  'Europe/Paris': 'temperate',
  'Europe/Berlin': 'temperate',
  'Asia/Tokyo': 'temperate',
  'Australia/Sydney': 'temperate',
  'America/Chicago': 'temperate',
  'Europe/Madrid': 'temperate',
  
  // Cool zones
  'Europe/Stockholm': 'cool',
  'Europe/Helsinki': 'cool',
  'America/Anchorage': 'cool',
  'Europe/Oslo': 'cool',
  'America/Toronto': 'cool',
  'Europe/Moscow': 'cool',
  'Asia/Vladivostok': 'cool'
};

export function detectClimateFromTimezone(): ClimateKey {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_CLIMATE_MAP[timezone] || 'temperate';
  } catch (error) {
    console.warn('Failed to detect timezone, defaulting to temperate climate');
    return 'temperate';
  }
}

export function getClimateEmoji(climateKey: ClimateKey): string {
  switch (climateKey) {
    case 'tropical': return '🌴';
    case 'subtropical': return '🌤️';
    case 'temperate': return '🌿';
    case 'cool': return '❄️';
    default: return '🌿';
  }
}