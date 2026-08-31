import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '../screens/ExploreScreen';
import ToolsNavigator from './ToolsNavigator';
import StoreNavigator from './StoreNavigator';
import ServicesNavigator from './ServicesNavigator';
import MyWorkspaceScreen from '../screens/MyWorkspaceScreen';
import ApiDashboardScreen from '../screens/ApiDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

/**
 * Home for the product areas that used to be buried in the Profile menu:
 * Tools, Store, Services, Workspace, API and the admin surfaces.
 */
const ExploreNavigator = () => (
    <Stack.Navigator
        screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
        }}
    >
        <Stack.Screen name="ExploreHome" component={ExploreScreen} />
        <Stack.Screen name="Tools" component={ToolsNavigator} />
        <Stack.Screen name="Store" component={StoreNavigator} />
        <Stack.Screen name="Services" component={ServicesNavigator} />
        <Stack.Screen name="MyWorkspace" component={MyWorkspaceScreen} />
        <Stack.Screen name="ApiDashboard" component={ApiDashboardScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    </Stack.Navigator>
);

export default ExploreNavigator;
