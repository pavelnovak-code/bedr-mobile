import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PackageSelectScreen from '../screens/booking/PackageSelectScreen';
import CalendarSlotsScreen from '../screens/booking/CalendarSlotsScreen';
import ConfirmPayScreen from '../screens/booking/ConfirmPayScreen';
import { colors, fonts } from '../config/theme';

export type BookingStackParamList = {
  PackageSelect: undefined;
  CalendarSlots: { purchaseId: number; lessonTypeId: number; ltCode: string };
  ConfirmPay: { purchaseId: number; slotDatetime: string };
};

const Stack = createNativeStackNavigator<BookingStackParamList>();

export default function BookingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.heading, fontSize: 17 },
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
