import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions } from './screenOptions';
// Force reload comment v2
import JobFeedScreen from '../screens/JobFeedScreen';
import JobDetailScreen from '../screens/JobDetailScreen';
import JobApplicationScreen from '../screens/JobApplicationScreen';
import PremiumUpgradeScreen from '../screens/PremiumUpgradeScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import PostJobScreen from '../screens/PostJobScreen';
import CompanyProfileScreen from '../screens/CompanyProfileScreen';
import EmployerApplicantsScreen from '../screens/EmployerApplicantsScreen';
import SavedJobsScreen from '../screens/SavedJobsScreen';
import MyPostedJobsScreen from '../screens/MyPostedJobsScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const JobsNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={stackScreenOptions}
        >
            <Stack.Screen name="JobFeed" component={JobFeedScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="JobApplication" component={JobApplicationScreen} />
            <Stack.Screen name="PremiumUpgrade" component={PremiumUpgradeScreen} />
            <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
            <Stack.Screen name="EmployerApplicants" component={EmployerApplicantsScreen} />
            <Stack.Screen name="SavedJobs" component={SavedJobsScreen} />
            <Stack.Screen name="MyPostedJobs" component={MyPostedJobsScreen} />
            <Stack.Screen name="PostJob" component={PostJobScreen} />
            <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
        </Stack.Navigator>
    );
};

export default JobsNavigator;
