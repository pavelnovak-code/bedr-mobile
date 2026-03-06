import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, spacing, radius } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

const CIRCLE_SIZE = 28;

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Circles + connecting lines row */}
      <View style={styles.row}>
        {steps.map((_, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <React.Fragment key={index}>
              {/* Circle */}
              <View
                style={[
                  styles.circle,
                  (isCompleted || isActive)
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark-sharp" size={16} color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.circleNumber,
                      { color: (isCompleted || isActive) ? colors.white : colors.muted },
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              {/* Connecting line (not after last circle) */}
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: index < currentStep ? colors.primary : colors.border },
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Labels row */}
      <View style={styles.labelsRow}>
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <Text
              key={index}
              style={[
                styles.label,
                { color: isFuture ? colors.muted : colors.primary },
                isActive && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.xs,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    textAlign: 'center',
    flex: 1,
  },
  labelActive: {
    fontFamily: fonts.bold,
  },
});
