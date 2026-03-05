import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getAvatar, isUploadAvatar, getUploadFilename } from '../../config/avatars';
import { API_BASE } from '../../config/api';

interface AvatarProps {
  avatar: string | null;
  size?: number;
}

export default function Avatar({ avatar, size = 40 }: AvatarProps) {
  const fontSize = Math.round(size * 0.52);

  if (isUploadAvatar(avatar)) {
    const filename = getUploadFilename(avatar!);
    return (
      <Image
        source={{ uri: `${API_BASE}/uploads/avatars/${encodeURIComponent(filename)}` }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      />
    );
  }

  const def = getAvatar(avatar);
  return (
    <View
      style={[
        styles.emojiWrap,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: def.bg },
      ]}
    >
      <Text style={{ fontSize, lineHeight: fontSize * 1.2 }}>{def.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emojiWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
});
