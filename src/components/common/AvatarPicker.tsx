import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { AVATARS, AvatarDef } from '../../config/avatars';
import { colors, fonts, spacing, radius } from '../../config/theme';

interface AvatarPickerProps {
  selected: string; // 'avatar:N'
  onSelect: (value: string) => void;
}

export default function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const selectedId = parseInt(selected.replace('avatar:', '')) || 1;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Vyberte avatar:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.grid}>
          {AVATARS.map((a: AvatarDef) => {
            const isSelected = a.id === selectedId;
            return (
              <TouchableOpacity
                key={a.id}
                onPress={() => onSelect(`avatar:${a.id}`)}
                style={[
                  styles.avatarBtn,
                  { backgroundColor: a.bg },
                  isSelected && styles.avatarSelected,
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
    color: colors.muted,
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
  avatarSelected: {
    borderColor: colors.primaryDark,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
});
