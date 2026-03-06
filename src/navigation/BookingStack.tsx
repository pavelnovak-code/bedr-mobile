import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PackageSelectScreen from '../screens/booking/PackageSelectScreen';
import CalendarSlotsScreen from '../screens/booking/CalendarSlotsScreen';
import ConfirmPayScreen from '../screens/booking/ConfirmPayScreen';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

export type BookingStackParamList = {
  PackageSelect: undefined;
  CalendarSlots: {
    packageId: number;
    packageName: string;
    lessonCount: number;
    lessonTypeCode: string;
    price: number;
    // Pro rezervaci z existujícího balíčku:
    purchaseId?: number;
  };
  ConfirmPay: {
    packageId: number;
    packageName: string;
    lessonCount: number;
    lessonTypeCode: string;
    price: number;
    slotDatetime: string;
  };
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontFamily: fonts.heading, fontSize: 17, color: colors.white },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="PackageSelect"
        component={PackageSelectScreen}
        options={{ title: 'Vyberte balíček' }}
      />
      <Stack.Screen
        name="CalendarSlots"
        component={CalendarSlotsScreen}
        options={{ title: 'Vyberte termín' }}
      />
      <Stack.Screen
        name="ConfirmPay"
        component={ConfirmPayScreen}
        options={{ title: 'Potvrzení' }}
      />
    </Stack.Navigator>
  );
}
