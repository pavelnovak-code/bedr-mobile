import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AVATARS, AvatarDef, isUploadAvatar, getUploadFilename } from '../../config/avatars';
import { API_BASE } from '../../config/api';
import { fonts, spacing, radius } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface AvatarPickerProps {
  selected: string; // 'avatar:N' nebo 'upload:filename'
  onSelect: (value: string) => void;
  /** Callback pro nahrání fotky — vrací URI vybraného souboru */
  onPickPhoto?: () => void;
  /** URI lokálně vybraného obrázku (před uploadem) */
  localPhotoUri?: string | null;
}

export default function AvatarPicker({ selected, onSelect, onPickPhoto, localPhotoUri }: AvatarPickerProps) {
  const { colors } = useTheme();
  const isEmojiSelected = selected.startsWith('avatar:');
  const selectedId = isEmojiSelected ? (parseInt(selected.replace('avatar:', '')) || 1) : -1;
  const isPhotoSelected = isUploadAvatar(selected) || !!localPhotoUri;

  // Zobrazení aktuální fotky (lokální URI má přednost)
  const photoUri = localPhotoUri
    || (isUploadAvatar(selected) ? `${API_BASE}/uploads/avatars/${encodeURIComponent(getUploadFilename(selected))}` : null);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.muted }]}>Vyberte avatar:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {/* Tlačítko pro nahrání fotky */}
          {onPickPhoto && (
            <TouchableOpacity
              onPress={onPickPhoto}
              style={[
                styles.avatarBtn,
                { backgroundColor: colors.border },
                styles.photoBtn,
                isPhotoSelected && !isEmojiSelected && { borderColor: colors.primary },
              ]}
              activeOpacity={0.7}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImg} />
              ) : (
                <Ionicons name="camera-outline" size={24} color={colors.muted} />
              )}
            </TouchableOpacity>
          )}
          {/* Emoji avatary */}
          {AVATARS.map((a: AvatarDef) => {
            const isSelected = isEmojiSelected && a.id === selectedId;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => onSelect(`avatar:${a.id}`)}
                style={[
                  styles.avatarBtn,
                  { backgroundColor: a.bg },
                  isSelected && { borderColor: colors.primary },
                ]}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{a.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  photoBtn: {
    overflow: 'hidden',
  },
  photoImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
});
