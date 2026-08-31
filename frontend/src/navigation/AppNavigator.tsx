import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import HomeNavigator from './HomeNavigator';
import ProfileNavigator from './ProfileNavigator';
import AuthNavigator from './AuthNavigator';
import ExploreNavigator from './ExploreNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import JobsNavigator from './JobsNavigator';
import CourseNavigator from './CourseNavigator';
import TabBar from './TabBar';
import theme from '../constants/theme.json';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();

/**
 * Five primary tabs. Marketplace and Academy remain registered so Explore and
 * deep links can `navigate()` to them, but they stay off the bar — five is the
 * most that stays comfortably tappable on a small phone.
 */
const TabNavigator = () => (
    <Tab.Navigator
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
            headerShown: false,
            // The bar floats above content, so screens keep their own bottom inset.
            tabBarHideOnKeyboard: true,
        }}
    >
        <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'Home' }} />
        <Tab.Screen name="Jobs" component={JobsNavigator} options={{ title: 'Jobs' }} />
        <Tab.Screen name="Explore" component={ExploreNavigator} options={{ title: 'Explore' }} />
        <Tab.Screen name="Academy" component={CourseNavigator} options={{ title: 'Academy' }} />
        <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profile' }} />
        <Tab.Screen
            name="Marketplace"
            component={MarketplaceNavigator}
            options={{ title: 'Marketplace', tabBarButton: () => null }}
        />
    </Tab.Navigator>
);

const navTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: theme.background,
        card: theme.backgroundElevated,
        text: theme.text,
        border: theme.borderSubtle,
        primary: theme.primary,
    },
};

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer theme={navTheme}>
            {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
