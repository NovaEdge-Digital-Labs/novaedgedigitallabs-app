import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import BusinessInquiryScreen from '../screens/BusinessInquiryScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const HomeNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: COLORS.background },
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="BusinessInquiry" component={BusinessInquiryScreen} />
        </Stack.Navigator>
    );
};

export default HomeNavigator;
