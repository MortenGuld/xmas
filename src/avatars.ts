/**
 * Unique SVG Avatar Generator
 * Creates personalized cartoon avatars for each team member
 */

interface AvatarConfig {
  skinTone: string;
  hairColor: string;
  hairStyle: 'short' | 'medium' | 'long' | 'bald' | 'curly' | 'spiky';
  shirtColor: string;
  hasGlasses: boolean;
  hasBeard: boolean;
  eyeColor: string;
  accessory?: 'earring' | 'bowtie' | 'necklace' | null;
}

// Predefined unique configs for each leader
const AVATAR_CONFIGS: Record<string, AvatarConfig> = {
  'Arne': {
    skinTone: '#f5d0c5',
    hairColor: '#8B4513',
    hairStyle: 'short',
    shirtColor: '#2563eb',
    hasGlasses: true,
    hasBeard: false,
    eyeColor: '#4a7c59'
  },
  'Michael': {
    skinTone: '#e8beac',
    hairColor: '#1a1a1a',
    hairStyle: 'medium',
    shirtColor: '#dc2626',
    hasGlasses: false,
    hasBeard: true,
    eyeColor: '#4a3728'
  },
  'Erling': {
    skinTone: '#fce7d6',
    hairColor: '#d4a84b',
    hairStyle: 'spiky',
    shirtColor: '#059669',
    hasGlasses: false,
    hasBeard: false,
    eyeColor: '#5b92c4'
  },
  'Kinga': {
    skinTone: '#f5d0c5',
    hairColor: '#4a3728',
    hairStyle: 'long',
    shirtColor: '#7c3aed',
    hasGlasses: false,
    hasBeard: false,
    eyeColor: '#2d5a27',
    accessory: 'earring'
  },
  'Lotte': {
    skinTone: '#fce7d6',
    hairColor: '#c9302c',
    hairStyle: 'medium',
    shirtColor: '#ec4899',
    hasGlasses: true,
    hasBeard: false,
    eyeColor: '#5b92c4',
    accessory: 'necklace'
  },
  'Morten': {
    skinTone: '#e8beac',
    hairColor: '#6b4423',
    hairStyle: 'short',
    shirtColor: '#f59e0b',
    hasGlasses: false,
    hasBeard: true,
    eyeColor: '#4a7c59'
  },
  'Klaus': {
    skinTone: '#f5d0c5',
    hairColor: '#d1d5db',
    hairStyle: 'bald',
    shirtColor: '#0891b2',
    hasGlasses: true,
    hasBeard: true,
    eyeColor: '#6b7280'
  },
  'Karolina': {
    skinTone: '#fce7d6',
    hairColor: '#1a1a1a',
    hairStyle: 'curly',
    shirtColor: '#be185d',
    hasGlasses: false,
    hasBeard: false,
    eyeColor: '#4a3728',
    accessory: 'earring'
  },
  'Pawel': {
    skinTone: '#e8beac',
    hairColor: '#4a3728',
    hairStyle: 'medium',
    shirtColor: '#16a34a',
    hasGlasses: false,
    hasBeard: false,
    eyeColor: '#5b92c4',
    accessory: 'bowtie'
  }
};

// Default config for unknown names
const DEFAULT_CONFIG: AvatarConfig = {
  skinTone: '#f5d0c5',
  hairColor: '#6b4423',
  hairStyle: 'short',
  shirtColor: '#6366f1',
  hasGlasses: false,
  hasBeard: false,
  eyeColor: '#4a7c59'
};

function getHairPath(style: AvatarConfig['hairStyle']): string {
  switch (style) {
    case 'short':
      return `<path d="M25 35 Q25 20 50 15 Q75 20 75 35 Q70 25 50 22 Q30 25 25 35" fill="currentColor"/>`;
    case 'medium':
      return `<path d="M22 40 Q20 20 50 12 Q80 20 78 40 Q75 25 50 20 Q25 25 22 40" fill="currentColor"/>
              <path d="M22 40 Q18 45 20 55" stroke="currentColor" stroke-width="3" fill="none"/>
              <path d="M78 40 Q82 45 80 55" stroke="currentColor" stroke-width="3" fill="none"/>`;
    case 'long':
      return `<path d="M20 45 Q18 20 50 10 Q82 20 80 45 Q80 70 70 80 L30 80 Q20 70 20 45" fill="currentColor"/>
              <ellipse cx="50" cy="45" rx="28" ry="32" fill="var(--skin)"/>`;
    case 'bald':
      return `<ellipse cx="50" cy="28" rx="20" ry="8" fill="currentColor" opacity="0.3"/>`;
    case 'curly':
      return `<circle cx="30" cy="25" r="8" fill="currentColor"/>
              <circle cx="42" cy="18" r="9" fill="currentColor"/>
              <circle cx="58" cy="18" r="9" fill="currentColor"/>
              <circle cx="70" cy="25" r="8" fill="currentColor"/>
              <circle cx="25" cy="38" r="7" fill="currentColor"/>
              <circle cx="75" cy="38" r="7" fill="currentColor"/>
              <circle cx="22" cy="52" r="6" fill="currentColor"/>
              <circle cx="78" cy="52" r="6" fill="currentColor"/>`;
    case 'spiky':
      return `<path d="M30 35 L25 15 L35 30 L40 10 L45 28 L50 8 L55 28 L60 10 L65 30 L75 15 L70 35" fill="currentColor"/>
              <path d="M25 35 Q25 28 30 35 Q50 25 70 35 Q75 28 75 35" fill="currentColor"/>`;
    default:
      return '';
  }
}

function getGlasses(): string {
  return `
    <g class="glasses" fill="none" stroke="#1a1a1a" stroke-width="2">
      <circle cx="38" cy="48" r="8" fill="rgba(255,255,255,0.1)"/>
      <circle cx="62" cy="48" r="8" fill="rgba(255,255,255,0.1)"/>
      <path d="M46 48 L54 48"/>
      <path d="M30 48 L25 45"/>
      <path d="M70 48 L75 45"/>
    </g>
  `;
}

function getBeard(_skinTone: string): string {
  return `
    <g class="beard">
      <path d="M30 60 Q30 75 50 82 Q70 75 70 60 Q65 65 50 68 Q35 65 30 60"
            fill="currentColor" opacity="0.8"/>
      <path d="M35 58 Q50 62 65 58" stroke="currentColor" stroke-width="2" fill="none" opacity="0.6"/>
    </g>
  `;
}

function getAccessory(type: AvatarConfig['accessory']): string {
  switch (type) {
    case 'earring':
      return `
        <circle cx="23" cy="52" r="3" fill="#ffd700"/>
        <circle cx="77" cy="52" r="3" fill="#ffd700"/>
      `;
    case 'bowtie':
      return `
        <g transform="translate(50, 88)">
          <path d="M-12 0 L-5 -5 L-5 5 Z" fill="#c41e3a"/>
          <path d="M12 0 L5 -5 L5 5 Z" fill="#c41e3a"/>
          <circle cx="0" cy="0" r="4" fill="#c41e3a"/>
        </g>
      `;
    case 'necklace':
      return `
        <path d="M35 82 Q50 90 65 82" stroke="#ffd700" stroke-width="2" fill="none"/>
        <circle cx="50" cy="88" r="4" fill="#ffd700"/>
      `;
    default:
      return '';
  }
}

export function generateAvatar(name: string): string {
  const config = AVATAR_CONFIGS[name] || DEFAULT_CONFIG;

  return `
    <svg viewBox="0 0 100 100" class="avatar-svg" style="--skin: ${config.skinTone}">
      <defs>
        <clipPath id="avatarClip-${name}">
          <circle cx="50" cy="50" r="48"/>
        </clipPath>
        <linearGradient id="bgGrad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${config.shirtColor};stop-opacity:0.3"/>
          <stop offset="100%" style="stop-color:${config.shirtColor};stop-opacity:0.1"/>
        </linearGradient>
        <filter id="shadow-${name}">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.2"/>
        </filter>
      </defs>

      <g clip-path="url(#avatarClip-${name})">
        <!-- Background -->
        <circle cx="50" cy="50" r="50" fill="url(#bgGrad-${name})"/>

        <!-- Neck -->
        <rect x="40" y="70" width="20" height="20" fill="${config.skinTone}"/>

        <!-- Shirt/Body -->
        <ellipse cx="50" cy="105" rx="35" ry="25" fill="${config.shirtColor}"/>
        <ellipse cx="50" cy="105" rx="30" ry="20" fill="${config.shirtColor}" opacity="0.8"/>

        <!-- Shirt collar -->
        <path d="M40 82 L50 90 L60 82" stroke="${config.shirtColor}" stroke-width="8" fill="none"
              style="filter: brightness(0.8)"/>

        <!-- Accessory (bowtie/necklace) -->
        ${config.accessory ? getAccessory(config.accessory) : ''}

        <!-- Head base -->
        <ellipse cx="50" cy="48" rx="28" ry="32" fill="${config.skinTone}" filter="url(#shadow-${name})"/>

        <!-- Ears -->
        <ellipse cx="22" cy="50" rx="5" ry="7" fill="${config.skinTone}"/>
        <ellipse cx="78" cy="50" rx="5" ry="7" fill="${config.skinTone}"/>

        <!-- Ear detail -->
        <path d="M20 48 Q22 50 20 52" stroke="${config.skinTone}" stroke-width="1" fill="none"
              style="filter: brightness(0.9)"/>
        <path d="M80 48 Q78 50 80 52" stroke="${config.skinTone}" stroke-width="1" fill="none"
              style="filter: brightness(0.9)"/>

        <!-- Earrings if applicable -->
        ${config.accessory === 'earring' ? getAccessory('earring') : ''}

        <!-- Hair (behind for long styles) -->
        <g style="color: ${config.hairColor}">
          ${getHairPath(config.hairStyle)}
        </g>

        <!-- Eyes -->
        <g class="eyes">
          <!-- Eye whites -->
          <ellipse cx="38" cy="48" rx="7" ry="8" fill="white"/>
          <ellipse cx="62" cy="48" rx="7" ry="8" fill="white"/>

          <!-- Irises -->
          <circle cx="39" cy="49" r="5" fill="${config.eyeColor}"/>
          <circle cx="63" cy="49" r="5" fill="${config.eyeColor}"/>

          <!-- Pupils -->
          <circle cx="40" cy="49" r="2.5" fill="#1a1a1a"/>
          <circle cx="64" cy="49" r="2.5" fill="#1a1a1a"/>

          <!-- Eye shine -->
          <circle cx="41" cy="47" r="1.5" fill="white" opacity="0.8"/>
          <circle cx="65" cy="47" r="1.5" fill="white" opacity="0.8"/>
        </g>

        <!-- Eyebrows -->
        <path d="M32 40 Q38 37 44 40" stroke="${config.hairColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M56 40 Q62 37 68 40" stroke="${config.hairColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>

        <!-- Nose -->
        <path d="M50 52 Q52 58 50 62 Q48 60 47 58" stroke="${config.skinTone}" stroke-width="2" fill="none"
              style="filter: brightness(0.85)"/>

        <!-- Mouth - friendly smile -->
        <path d="M42 68 Q50 75 58 68" stroke="#c9302c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M44 68 Q50 73 56 68" fill="#fff" opacity="0.5"/>

        <!-- Cheek blush -->
        <ellipse cx="30" cy="58" rx="6" ry="4" fill="#ffb6c1" opacity="0.4"/>
        <ellipse cx="70" cy="58" rx="6" ry="4" fill="#ffb6c1" opacity="0.4"/>

        <!-- Beard if applicable -->
        ${config.hasBeard ? `<g style="color: ${config.hairColor}">${getBeard(config.skinTone)}</g>` : ''}

        <!-- Glasses if applicable -->
        ${config.hasGlasses ? getGlasses() : ''}
      </g>

      <!-- Border -->
      <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    </svg>
  `;
}

/** Get a color for fallback initials based on name */
export function getAvatarColor(name: string): string {
  const config = AVATAR_CONFIGS[name] || DEFAULT_CONFIG;
  return config.shirtColor;
}
