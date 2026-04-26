import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
// Force reload comment v2
import JobFeedScreen from '../screens/JobFeedScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import JobApplicationScreen from '../screens/JobApplicationScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import PostJobScreen from '../screens/PostJobScreen';
import CompanyProfileScreen from '../screens/CompanyProfileScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const JobsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: COLORS.background },
            }}
        >
            <Stack.Screen name="JobFeed" component={JobFeedScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="JobApplication" component={JobApplicationScreen} />
            <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
            <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
        </Stack.Navigator>
    );
};

export default JobsNavigator;
