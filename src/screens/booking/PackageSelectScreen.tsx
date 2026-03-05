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
import { getMyPurchases } from '../../api/purchases';
import { Purchase } from '../../api/types';
import Spinner from '../../components/common/Spinner';
import Card from '../../components/common/Card';
import { colors, fonts, spacing, radius } from '../../config/theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'PackageSelect'>;

export default function PackageSelectScreen({ navigation }: Props) {
  const { studioId } = useStudio();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchases = async () => {
    if (!studioId) return;
    try {
      const data = await getMyPurchases(studioId);
      setPurchases(data.filter(p => p.lessons_remaining > 0));
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadPurchases(); }, [studioId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const selectPurchase = (p: Purchase) => {
    navigation.navigate('CalendarSlots', {
      purchaseId: p.id,
      lessonTypeId: p.lessons_total, // Backend má lesson_type_id v purchase
      ltCode: 'A', // Defaultně, bude upřesněno dle balíčku
    });
  };

  if (loading) return <Spinner fullScreen message="Načítám balíčky..." />;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <Text style={styles.heading}>Krok 1: Vyberte balíček</Text>
      <Text style={styles.desc}>Vyberte permanentku, ze které chcete rezervovat lekci.</Text>

      {purchases.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            Nemáte žádný aktivní balíček. Nejprve si kupte permanentku.
          </Text>
        </Card>
      ) : (
        purchases.map(p => (
          <TouchableOpacity key={p.id} onPress={() => selectPurchase(p)} activeOpacity={0.7}>
            <Card style={styles.pkgCard}>
              <View style={styles.pkgHeader}>
                <Text style={styles.pkgName}>{p.package_name}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {p.lessons_remaining} / {p.lessons_total}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round((p.lessons_remaining / p.lessons_total) * 100)}%` },
                  ]}
                />
              </View>

              <View style={styles.pkgFooter}>
                <Text style={styles.pkgMeta}>
                  Platnost: {new Date(p.valid_until).toLocaleDateString('cs-CZ')}
                </Text>
                <Text style={styles.pkgArrow}>→</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },

  heading: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginBottom: spacing.xs },
  desc: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: spacing.xl },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },

  pkgCard: { marginBottom: spacing.md },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  pkgName: { fontFamily: fonts.semiBold, fontSize: 16, color: colors.text, flex: 1 },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },

  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: spacing.md },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },

  pkgFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgMeta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pkgArrow: { fontFamily: fonts.bold, fontSize: 18, color: colors.primary },
});
