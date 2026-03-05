import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useStudio } from '../../context/StudioContext';
import { getSlots } from '../../api/slots';
import { bookReservation } from '../../api/reservations';
import { Slot } from '../../api/types';
import { formatMonthYear, formatShortDate, formatDT } from '../../utils/dateFormat';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { colors, fonts, spacing, radius } from '../../config/theme';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isToday, isBefore } from 'date-fns';

type Props = NativeStackScreenProps<BookingStackParamList, 'CalendarSlots'>;

export default function CalendarSlotsScreen({ navigation, route }: Props) {
  const { packageId, packageName, lessonCount, lessonTypeCode, price, purchaseId } = route.params;
  const { studioId } = useStudio();
  const isBookFromPurchase = !!purchaseId; // režim rezervace z existujícího balíčku

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState<string | null>(null);

  // Dny v kalendáři
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Při výběru dne načti sloty
  useEffect(() => {
    if (!selectedDate || !studioId) return;
    setLoadingSlots(true);
    getSlots(studioId, selectedDate, lessonTypeCode)
      .then(data => {
        const available = Array.isArray(data) ? data : [];
        setSlots(available.filter(s => s.available && !s.is_closed && !s.is_past));
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, studioId, lessonTypeCode]);

  const selectSlot = async (slot: Slot) => {
    const slotDatetime = slot.datetime || `${selectedDate}T${slot.time}:00`;

    if (isBookFromPurchase && studioId) {
      // Přímá rezervace z existujícího balíčku
      setBooking(true);
      try {
        await bookReservation({ purchase_id: purchaseId!, slot_datetime: slotDatetime, studio_id: studioId });
        setBookSuccess(slotDatetime);
      } catch (e: any) {
        RNAlert.alert('Chyba', e.response?.data?.error || e.message || 'Rezervace se nezdařila');
      } finally {
        setBooking(false);
      }
      return;
    }

    // Standardní flow — pokračuj na ConfirmPay (nový nákup)
    navigation.navigate('ConfirmPay', {
      packageId,
      packageName,
      lessonCount,
      lessonTypeCode,
      price,
      slotDatetime,
    });
  };

  const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  // Offset pro první den měsíce (pondělí = 0)
  const firstDayOffset = useMemo(() => {
    const day = startOfMonth(currentMonth).getDay();
    return day === 0 ? 6 : day - 1;
  }, [currentMonth]);

  // Success screen po přímé rezervaci z balíčku
  if (bookSuccess) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Lekce zarezervována!</Text>
        <Text style={styles.successPkg}>{packageName}</Text>
        <Text style={styles.successText}>{formatDT(bookSuccess)}</Text>
        <Button
          title="Zpět na přehled"
          onPress={() => navigation.getParent()?.navigate('Dashboard')}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{isBookFromPurchase ? 'Rezervovat lekci' : 'Krok 2: Vyberte termín'}</Text>
      <Text style={styles.pkgInfo}>{packageName} • {lessonTypeCode === 'B' ? '60 min' : '30 min'}</Text>

      {/* Měsíc navigace */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <Text style={styles.monthArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonthYear(currentMonth)}</Text>
        <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <Text style={styles.monthArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Kalendář */}
      <Card padded={false} style={styles.calCard}>
        <View style={styles.dayNamesRow}>
          {dayNames.map(d => (
            <Text key={d} style={styles.dayNameText}>{d}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {/* Prázdné buňky pro offset */}
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
                  isSelected && styles.dayCellSelected,
                  today && !isSelected && styles.dayCellToday,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  isPast && styles.dayTextPast,
                  isSelected && styles.dayTextSelected,
                ]}>
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      {/* Dostupné sloty */}
      {selectedDate && (
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>
            Dostupné časy – {formatShortDate(selectedDate)}
          </Text>
          {loadingSlots ? (
            <Spinner message="Načítám sloty..." />
          ) : slots.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>Žádné volné časy v tento den</Text>
            </Card>
          ) : (
            <View style={styles.slotsGrid}>
              {slots.map(slot => (
                <TouchableOpacity
                  key={slot.time}
                  onPress={() => selectSlot(slot)}
                  style={styles.slotBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.slotTime}>{slot.time}</Text>
                  {slot.trainer && (
                    <Text style={styles.slotTrainer}>{slot.trainer.name}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  heading: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginBottom: spacing.xs },
  pkgInfo: { fontFamily: fonts.regular, fontSize: 14, color: colors.primary, marginBottom: spacing.lg },

  // Month nav
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  monthArrow: { fontSize: 28, color: colors.primary, paddingHorizontal: spacing.md },
  monthLabel: { fontFamily: fonts.heading, fontSize: 17, color: colors.text, textTransform: 'capitalize' },

  // Calendar
  calCard: { marginBottom: spacing.lg, padding: spacing.md },
  dayNamesRow: { flexDirection: 'row', marginBottom: spacing.xs },
  dayNameText: { flex: 1, textAlign: 'center', fontFamily: fonts.semiBold, fontSize: 12, color: colors.muted },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.full,
  },
  dayText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  dayTextPast: { color: colors.border },
  dayTextSelected: { color: colors.white },

  // Slots
  slotsSection: { marginTop: spacing.sm },
  slotsTitle: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: spacing.md },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotBtn: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    minWidth: 80,
  },
  slotTime: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary },
  slotTrainer: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },

  // Success
  successContainer: {
    flex: 1, backgroundColor: colors.bg, justifyContent: 'center',
    alignItems: 'center', padding: spacing.xl,
  },
  successIcon: { fontSize: 64, marginBottom: spacing.lg },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, marginBottom: spacing.sm },
  successPkg: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary, marginBottom: spacing.xs },
  successText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
});
