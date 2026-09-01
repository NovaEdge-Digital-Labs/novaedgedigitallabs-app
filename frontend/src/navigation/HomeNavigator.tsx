import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import BusinessInquiryScreen from '../screens/BusinessInquiryScreen';
import { COLORS } from '../constants/colors';

import BlogScreen from '../screens/BlogScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';

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
            <Stack.Screen name="MiniAppScreen" component={require('../screens/MiniAppScreen').default} />
            <Stack.Screen name="BlogScreen" component={BlogScreen} />
            <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
        </Stack.Navigator>
    );
};

export default HomeNavigator;
