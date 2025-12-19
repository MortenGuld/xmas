/**
 * Avatar image mapping for team members
 * Uses real photos from /people folder
 */

// Map names to their image filenames
const AVATAR_IMAGES: Record<string, string> = {
  'Arne': 'arne.jpg',
  'Michael': 'Michael.jpg',
  'Erling': 'erling.jpg',
  'Kinga': 'kinga.jpg',
  'Lotte': 'lotte.jpg',
  'Morten': 'morten.jpg',
  'Klaus': 'klaus.jpg',
  'Karolina': 'karolina.jpg',
  'Pawel': 'pawel.jpg',
  'Maksymilian': 'maks.jpg'
};

/**
 * Generate avatar HTML using real photo
 */
export function generateAvatar(name: string): string {
  const imageFile = AVATAR_IMAGES[name];

  if (imageFile) {
    return `
      <div class="avatar-photo-wrapper">
        <img
          src="/people/${imageFile}"
          alt="${name}"
          class="avatar-photo"
          loading="eager"
          draggable="false"
        />
      </div>
    `;
  }

  // Fallback to initials if no image
  const initials = name.charAt(0).toUpperCase();
  return `
    <div class="avatar-initials">
      <span>${initials}</span>
    </div>
  `;
}

/**
 * Get avatar color for ornament (used for glow effects)
 */
export function getAvatarColor(name: string): string {
  const colors: Record<string, string> = {
    'Arne': '#c41e3a',
    'Michael': '#00843d',
    'Erling': '#ffd700',
    'Kinga': '#4169e1',
    'Lotte': '#9932cc',
    'Morten': '#ff6b6b',
    'Klaus': '#20b2aa',
    'Karolina': '#ff8c00',
    'Pawel': '#da70d6',
    'Maksymilian': '#3498db'
  };
  return colors[name] || '#ffd700';
}
