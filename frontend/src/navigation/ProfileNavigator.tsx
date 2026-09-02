import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions } from './screenOptions';
import ProfileScreen from '../screens/ProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import MyPurchasesScreen from '../screens/MyPurchasesScreen';
import SupportScreen from '../screens/SupportScreen';
import AboutScreen from '../screens/AboutScreen';
import ReferEarnScreen from '../screens/ReferEarnScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import ApiDashboardScreen from '../screens/ApiDashboardScreen';
import ApiReferenceScreen from '../screens/ApiReferenceScreen';
import UserGuidesScreen from '../screens/UserGuidesScreen';
import GuideDetailScreen from '../screens/GuideDetailScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import MyWorkspaceScreen from '../screens/MyWorkspaceScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import MyPostedJobsScreen from '../screens/MyPostedJobsScreen';
import EmployerApplicantsScreen from '../screens/EmployerApplicantsScreen';
import StoreNavigator from './StoreNavigator';
import ToolsNavigator from './ToolsNavigator';
import ServicesNavigator from './ServicesNavigator';
import PostJobScreen from '../screens/PostJobScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={stackScreenOptions}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="Store" component={StoreNavigator} />
            <Stack.Screen name="Tools" component={ToolsNavigator} />
            <Stack.Screen name="Services" component={ServicesNavigator} />
            <Stack.Screen name="MyWorkspace" component={MyWorkspaceScreen} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MyPurchases" component={MyPurchasesScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="ReferEarn" component={ReferEarnScreen} />
            <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
            <Stack.Screen name="ApiDashboard" component={ApiDashboardScreen} />
            <Stack.Screen name="ApiReference" component={ApiReferenceScreen} />
            <Stack.Screen name="UserGuides" component={UserGuidesScreen} />
            <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />

            {/* Job & Membership Stack Screens */}
            <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
            <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
            <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
            <Stack.Screen name="MyPostedJobs" component={MyPostedJobsScreen} />
            <Stack.Screen name="EmployerApplicants" component={EmployerApplicantsScreen} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
        </Stack.Navigator>
    );
};

export default ProfileNavigator;
