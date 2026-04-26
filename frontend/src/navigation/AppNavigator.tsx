import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import ToolsNavigator from './ToolsNavigator';
import ServicesNavigator from './ServicesNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import ProfileNavigator from './ProfileNavigator';
import AuthNavigator from './AuthNavigator';
import StoreNavigator from './StoreNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import JobsNavigator from './JobsNavigator';
import CourseNavigator from './CourseNavigator';
import { COLORS } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textMuted,
                tabBarStyle: {
                    backgroundColor: COLORS.background,
                    borderTopWidth: 1,
                    borderTopColor: COLORS.border,
                    height: 60,
                    paddingBottom: 8,
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'NovaEdge' }} />
            <Tab.Screen name="Marketplace" component={MarketplaceNavigator} />
            <Tab.Screen name="Jobs" component={JobsNavigator} />
            <Tab.Screen name="Store" component={StoreNavigator} />
            <Tab.Screen name="Tools" component={ToolsNavigator} />
            <Tab.Screen name="Services" component={ServicesNavigator} />
            <Tab.Screen name="Academy" component={CourseNavigator} />
            <Tab.Screen name="Profile" component={ProfileNavigator} />
        </Tab.Navigator>
    );
};

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default AppNavigator;
