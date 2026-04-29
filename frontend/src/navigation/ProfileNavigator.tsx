import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyPurchasesScreen from '../screens/MyPurchasesScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';
import ReferEarnScreen from '../screens/ReferEarnScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ApiDashboardScreen from '../screens/ApiDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: COLORS.background },
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyPurchases" component={MyPurchasesScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="ReferEarn" component={ReferEarnScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ApiDashboard" component={ApiDashboardScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
        </Stack.Navigator>
    );
};

export default ProfileNavigator;
