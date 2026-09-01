import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import ProfileNavigator from './ProfileNavigator';
import AuthNavigator from './AuthNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import JobsNavigator from './JobsNavigator';
import CourseNavigator from './CourseNavigator';
import RolePickerScreen from '../screens/RolePickerScreen';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

import { useThemeStore } from '../store/themeStore';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

const TabNavigator = () => {
    const { theme } = useThemeStore();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Store') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Marketplace') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Tools') {
                        iconName = focused ? 'apps' : 'apps-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Services') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Academy') {
                        iconName = focused ? 'school' : 'school-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                headerShown: false,
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.textMuted,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    height: 60,
                    paddingBottom: 8,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'NovaEdge' }} />
            <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
            <Tab.Screen name="Jobs" component={JobsNavigator} />
            <Tab.Screen name="Academy" component={CourseNavigator} />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};

/**
 * Authenticated users who haven't picked personas yet see the onboarding
 * picker as a full-screen overlay before they land on the main tabs.
 * Once `savePersonas()` writes to the store, this component re-renders
 * and the picker disappears — no manual navigation needed.
 */
const OnboardingGate = () => {
    const hasPersonas = useAuthStore(
        (s) => s.user?.personas && s.user.personas.length > 0
    );

    if (hasPersonas) return <TabNavigator />;

    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="RolePicker" component={RolePickerScreen} />
            <RootStack.Screen name="MainTabs" component={TabNavigator} />
        </RootStack.Navigator>
    );
};

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <OnboardingGate /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
