import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useStudio } from '../../context/StudioContext';
import { useTheme } from '../../context/ThemeContext';
import { getPackages } from '../../api/packages';
import { Package } from '../../api/types';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import StepIndicator from '../../components/common/StepIndicator';
import { fonts, spacing, radius } from '../../config/theme';
import { formatPrice } from '../../utils/formatPrice';

type Props = NativeStackScreenProps<BookingStackParamList, 'PackageSelect'>;

export default function PackageSelectScreen({ navigation }: Props) {
  const { studioId } = useStudio();
  const { colors } = useTheme();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPackages = async () => {
    if (!studioId) return;
    try {
      const data = await getPackages(studioId);
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('[Booking] Failed to load packages:', err);
    }
    setLoading(false);
  };

  useEffect(() => { loadPackages(); }, [studioId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPackages();
    setRefreshing(false);
  };

  const selectPackage = (pkg: Package) => {
    navigation.navigate('CalendarSlots', {
      packageId: pkg.id,
      packageName: pkg.name,
      lessonCount: pkg.lesson_count,
      lessonTypeCode: (pkg as any).lesson_type_code || 'A',
      price: pkg.price,
    });
  };

  if (loading) return <Spinner fullScreen message="Načítám balíčky..." />;

  // Skupiny podle typu lekce
  const typeA = packages.filter((p: any) => (p.lesson_type_code || '') === 'A');
  const typeB = packages.filter((p: any) => (p.lesson_type_code || '') === 'B');

  return (
    <View style={[styles.screenContainer, { backgroundColor: colors.bg }]}>
      <StepIndicator steps={['Balíček', 'Termín', 'Potvrzení']} currentStep={0} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.desc}>Vyberte si permanentku, kterou chcete zakoupit.</Text>

      {packages.length === 0 ? (
        <Card>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Žádné dostupné balíčky pro toto studio.
          </Text>
        </Card>
      ) : (
        <>
          {typeA.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>EMS 30 min</Text>
              </View>
              {typeA.map(pkg => (
                <TouchableOpacity key={pkg.id} onPress={() => selectPackage(pkg)} activeOpacity={0.7}>
                  <Card style={styles.pkgCard}>
                    <View style={styles.pkgHeader}>
                      <View style={styles.pkgInfo}>
                        <Text style={[styles.pkgName, { color: colors.text }]}>{pkg.name}</Text>
                        <Text style={[styles.pkgDetail, { color: colors.muted }]}>
                          {pkg.lesson_count} {pkg.lesson_count === 1 ? 'lekce' : pkg.lesson_count < 5 ? 'lekce' : 'lekcí'}
                          {pkg.validity_weeks > 0 ? ` • ${pkg.validity_weeks} týdnů` : ''}
                        </Text>
                        {pkg.allowed_times && (
                          <Text style={[styles.pkgTimes, { color: colors.warning }]}>
                            ⏰ {formatAllowedTimes(pkg.allowed_times)}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.priceBox, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.priceText, { color: colors.primary }]}>{formatPrice(pkg.price)}</Text>
                        {pkg.lesson_count > 1 && (
                          <Text style={[styles.pricePerLesson, { color: colors.muted }]}>
                            {formatPrice(Math.round(pkg.price / pkg.lesson_count))}/lekce
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}

          {typeB.length > 0 && (
            <>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flash-outline" size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>EMS 60 min</Text>
              </View>
              {typeB.map(pkg => (
                <TouchableOpacity key={pkg.id} onPress={() => selectPackage(pkg)} activeOpacity={0.7}>
                  <Card style={styles.pkgCard}>
                    <View style={styles.pkgHeader}>
                      <View style={styles.pkgInfo}>
                        <Text style={[styles.pkgName, { color: colors.text }]}>{pkg.name}</Text>
                        <Text style={[styles.pkgDetail, { color: colors.muted }]}>
                          {pkg.lesson_count} {pkg.lesson_count === 1 ? 'lekce' : pkg.lesson_count < 5 ? 'lekce' : 'lekcí'}
                          {pkg.validity_weeks > 0 ? ` • ${pkg.validity_weeks} týdnů` : ''}
                        </Text>
                        {pkg.allowed_times && (
                          <Text style={[styles.pkgTimes, { color: colors.warning }]}>
                            ⏰ {formatAllowedTimes(pkg.allowed_times)}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.priceBox, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[styles.priceText, { color: colors.primary }]}>{formatPrice(pkg.price)}</Text>
                        {pkg.lesson_count > 1 && (
                          <Text style={[styles.pricePerLesson, { color: colors.muted }]}>
                            {formatPrice(Math.round(pkg.price / pkg.lesson_count))}/lekce
                          </Text>
                        )}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
    </View>
  );
}

function formatAllowedTimes(json: string | null): string {
  if (!json) return '';
  try {
    const ranges = JSON.parse(json);
    return ranges.map((r: any) => `${r.from}–${r.to}`).join(', ');
  } catch { return ''; }
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: spacing.lg },

  desc: { fontFamily: fonts.regular, fontSize: 14, marginBottom: spacing.xl },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center' },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 16,
  },
  pkgCard: { marginBottom: spacing.md },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgInfo: { flex: 1, marginRight: spacing.md },
  pkgName: { fontFamily: fonts.semiBold, fontSize: 15 },
  pkgDetail: { fontFamily: fonts.regular, fontSize: 13, marginTop: 2 },
  pkgTimes: { fontFamily: fonts.regular, fontSize: 12, marginTop: 4 },

  priceBox: { alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
  priceText: { fontFamily: fonts.bold, fontSize: 18 },
  pricePerLesson: { fontFamily: fonts.regular, fontSize: 11, marginTop: 2 },
});
