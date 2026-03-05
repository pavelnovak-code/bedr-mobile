// Portováno z public/js/common.js – AVATARS pole

export interface AvatarDef {
  id: number;
  emoji: string;
  bg: string;
  label: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 1,  emoji: '🏋️', bg: '#f97316', label: 'Fitness' },
  { id: 2,  emoji: '🤸', bg: '#22c55e', label: 'Gymnast' },
  { id: 3,  emoji: '🧘', bg: '#a855f7', label: 'Jóga' },
  { id: 4,  emoji: '🚴', bg: '#3b82f6', label: 'Cyklista' },
  { id: 5,  emoji: '⚡', bg: '#eab308', label: 'Energie' },
  { id: 6,  emoji: '🌟', bg: '#ec4899', label: 'Hvězda' },
  { id: 7,  emoji: '🦁', bg: '#f59e0b', label: 'Lev' },
  { id: 8,  emoji: '🐼', bg: '#14b8a6', label: 'Panda' },
  { id: 9,  emoji: '🦊', bg: '#ef4444', label: 'Liška' },
  { id: 10, emoji: '🎯', bg: '#dc2626', label: 'Cíl' },
  { id: 11, emoji: '🏄', bg: '#06b6d4', label: 'Surfař' },
  { id: 12, emoji: '🦅', bg: '#6366f1', label: 'Orel' },
];

export function getAvatar(avatarStr: string | null): AvatarDef {
  if (!avatarStr) return AVATARS[0];
  const id = parseInt(avatarStr.replace('avatar:', '')) || 1;
  return AVATARS.find(a => a.id === id) || AVATARS[0];
}

export function isUploadAvatar(avatarStr: string | null): boolean {
  return !!avatarStr && avatarStr.startsWith('upload:');
}

export function getUploadFilename(avatarStr: string): string {
  return avatarStr.replace('upload:', '');
}
