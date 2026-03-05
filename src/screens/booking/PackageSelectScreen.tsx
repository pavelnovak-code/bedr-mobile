import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useStudio } from '../../context/StudioContext';
import { getPackages } from '../../api/packages';
import { Package } from '../../api/types';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import { colors, fonts, spacing, radius } from '../../config/theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'PackageSelect'>;

export default function PackageSelectScreen({ navigation }: Props) {
  const { studioId } = useStudio();
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
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.heading}>Krok 1: Vyberte balíček</Text>
      <Text style={styles.desc}>Vyberte si permanentku, kterou chcete zakoupit.</Text>

      {packages.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Žádné dostupné balíčky pro toto studio.
          </Text>
        </Card>
      ) : (
        <>
          {typeA.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>EMS 30 min</Text>
              {typeA.map(pkg => (
                <TouchableOpacity key={pkg.id} onPress={() => selectPackage(pkg)} activeOpacity={0.7}>
                  <Card style={styles.pkgCard}>
                    <View style={styles.pkgHeader}>
                      <View style={styles.pkgInfo}>
                        <Text style={styles.pkgName}>{pkg.name}</Text>
                        <Text style={styles.pkgDetail}>
                          {pkg.lesson_count} {pkg.lesson_count === 1 ? 'lekce' : pkg.lesson_count < 5 ? 'lekce' : 'lekcí'}
                          {pkg.validity_weeks > 0 ? ` • ${pkg.validity_weeks} týdnů` : ''}
                        </Text>
                        {pkg.allowed_times && (
                          <Text style={styles.pkgTimes}>
                            ⏰ {formatAllowedTimes(pkg.allowed_times)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.priceBox}>
                        <Text style={styles.priceText}>{pkg.price} Kč</Text>
                        {pkg.lesson_count > 1 && (
                          <Text style={styles.pricePerLesson}>
                            {Math.round(pkg.price / pkg.lesson_count)} Kč/lekce
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
              <Text style={styles.sectionTitle}>EMS 60 min</Text>
              {typeB.map(pkg => (
                <TouchableOpacity key={pkg.id} onPress={() => selectPackage(pkg)} activeOpacity={0.7}>
                  <Card style={styles.pkgCard}>
                    <View style={styles.pkgHeader}>
                      <View style={styles.pkgInfo}>
                        <Text style={styles.pkgName}>{pkg.name}</Text>
                        <Text style={styles.pkgDetail}>
                          {pkg.lesson_count} {pkg.lesson_count === 1 ? 'lekce' : pkg.lesson_count < 5 ? 'lekce' : 'lekcí'}
                          {pkg.validity_weeks > 0 ? ` • ${pkg.validity_weeks} týdnů` : ''}
                        </Text>
                        {pkg.allowed_times && (
                          <Text style={styles.pkgTimes}>
                            ⏰ {formatAllowedTimes(pkg.allowed_times)}
                          </Text>
                        )}
                      </View>
                      <View style={styles.priceBox}>
                        <Text style={styles.priceText}>{pkg.price} Kč</Text>
                        {pkg.lesson_count > 1 && (
                          <Text style={styles.pricePerLesson}>
                            {Math.round(pkg.price / pkg.lesson_count)} Kč/lekce
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
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },

  heading: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginBottom: spacing.xs },
  desc: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: spacing.xl },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },

  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: 16, color: colors.primary,
    marginBottom: spacing.md, marginTop: spacing.md,
  },
  pkgCard: { marginBottom: spacing.md },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgInfo: { flex: 1, marginRight: spacing.md },
  pkgName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  pkgDetail: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  pkgTimes: { fontFamily: fonts.regular, fontSize: 12, color: colors.warning, marginTop: 4 },

  priceBox: { alignItems: 'flex-end' },
  priceText: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
  pricePerLesson: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
});
