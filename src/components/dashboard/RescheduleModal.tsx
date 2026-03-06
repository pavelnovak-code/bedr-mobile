import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert as RNAlert,
} from 'react-native';
import { useStudio } from '../../context/StudioContext';
import { useTheme } from '../../context/ThemeContext';
import { getSlots } from '../../api/slots';
import { moveReservation } from '../../api/reservations';
import { Slot } from '../../api/types';
import { formatShortDate, formatMonthYear } from '../../utils/dateFormat';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Card from '../common/Card';
import { fonts, spacing, radius } from '../../config/theme';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isToday,
  isBefore,
} from 'date-fns';

interface Props {
  visible: boolean;
  reservationId: number;
  lessonTypeCode?: string;
  onClose: () => void;
  onMoved: () => void;
}

export default function RescheduleModal({ visible, reservationId, lessonTypeCode, onClose, onMoved }: Props) {
  const { studioId } = useStudio();
  const { colors, isDark } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [moving, setMoving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setCurrentMonth(new Date());
      setSelectedDate(null);
      setSlots([]);
    }
  }, [visible]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOffset = useMemo(() => {
    const day = startOfMonth(currentMonth).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentMonth]);

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate || !studioId) return;
    setLoadingSlots(true);
    getSlots(studioId, selectedDate, lessonTypeCode, reservationId)
      .then(data => {
        const available = Array.isArray(data) ? data : [];
        setSlots(available.filter(s => s.available && !s.is_closed && !s.is_past));
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, studioId, lessonTypeCode, reservationId]);

  const handleSelectSlot = (slot: Slot) => {
    if (!selectedDate) return;
    const newDatetime = `${selectedDate}T${slot.time}:00`;

    RNAlert.alert(
      'Přesunout lekci',
      `Přesunout na ${formatShortDate(selectedDate)} v ${slot.time}?`,
      [
        { text: 'Ne', style: 'cancel' },
        {
          text: 'Ano, přesunout',
          onPress: async () => {
            setMoving(true);
            try {
              await moveReservation(reservationId, newDatetime);
              onMoved();
            } catch (e: any) {
              RNAlert.alert(
                'Chyba',
                e.response?.data?.error || e.message || 'Nepodařilo se přesunout lekci'
              );
            } finally {
              setMoving(false);
            }
          },
        },
      ]
    );
  };

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: colors.bg }]}>
        <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Přesunout lekci</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.closeBtn, { color: colors.muted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <Text style={[styles.monthArrow, { color: colors.primary }]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.monthLabel, { color: colors.text }]}>{formatMonthYear(currentMonth)}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <Text style={[styles.monthArrow, { color: colors.primary }]}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <Card padded={false} style={styles.calCard}>
            <View style={styles.dayNamesRow}>
              {dayNames.map(d => (
                <Text key={d} style={[styles.dayNameText, { color: colors.muted }]}>{d}</Text>
              ))}
            </View>
            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              {calendarDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isPast = isBefore(day, new Date()) && !isToday(day);
                const isSelected = dateStr === selectedDate;
                const today = isToday(day);

                return (
                  <TouchableOpacity
                    key={dateStr}
                    onPress={() => !isPast && setSelectedDate(dateStr)}
                    disabled={isPast}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: colors.primary, borderRadius: radius.full },
                      today && !isSelected && { backgroundColor: colors.primaryLight, borderRadius: radius.full },
                    ]}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: colors.text },
                      isPast && { color: colors.border },
                      isSelected && { color: colors.white },
                    ]}>
                      {format(day, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>

          {/* Available slots */}
          {selectedDate && (
            <View style={styles.slotsSection}>
              <Text style={[styles.slotsTitle, { color: colors.text }]}>
                Dostupné časy – {formatShortDate(selectedDate)}
              </Text>
              {loadingSlots ? (
                <Spinner message="Načítám sloty..." />
              ) : slots.length === 0 ? (
                <Card>
                  <Text style={[styles.emptyText, { color: colors.muted }]}>Žádné volné časy v tento den</Text>
                </Card>
              ) : (
                <View style={styles.slotsGrid}>
                  {slots.map(slot => (
                    <TouchableOpacity
                      key={slot.time}
                      onPress={() => handleSelectSlot(slot)}
                      style={[styles.slotBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
                      activeOpacity={0.7}
                      disabled={moving}
                    >
                      <Text style={[styles.slotTime, { color: colors.primary }]}>{slot.time}</Text>
                      {slot.trainer && (
                        <Text style={[styles.slotTrainer, { color: colors.muted }]}>{slot.trainer.name}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {moving && (
          <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)' }]}>
            <Spinner message="Přesouvám lekci..." />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: { fontFamily: fonts.heading, fontSize: 18 },
  closeBtn: { fontSize: 22, fontWeight: '600' },

  scroll: { flex: 1 },
  content: { padding: spacing.lg },

  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  monthArrow: { fontSize: 28, paddingHorizontal: spacing.md },
  monthLabel: { fontFamily: fonts.heading, fontSize: 17, textTransform: 'capitalize' },

  calCard: { marginBottom: spacing.lg, padding: spacing.md },
  dayNamesRow: { flexDirection: 'row', marginBottom: spacing.xs },
  dayNameText: { flex: 1, textAlign: 'center', fontFamily: fonts.semiBold, fontSize: 12 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontFamily: fonts.medium, fontSize: 14 },

  slotsSection: { marginTop: spacing.sm },
  slotsTitle: { fontFamily: fonts.heading, fontSize: 16, marginBottom: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotBtn: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    minWidth: 80,
  },
  slotTime: { fontFamily: fonts.semiBold, fontSize: 16 },
  slotTrainer: { fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
