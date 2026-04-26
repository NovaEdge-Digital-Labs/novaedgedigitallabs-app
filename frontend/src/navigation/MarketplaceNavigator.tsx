import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import GigDetailsScreen from '../screens/GigDetailsScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import CreateGigScreen from '../screens/CreateGigScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';
import ProposalScreen from '../screens/ProposalScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const MarketplaceNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="MarketplaceHome" component={MarketplaceScreen} />
            <Stack.Screen name="GigDetails" component={GigDetailsScreen} />
            <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
            <Stack.Screen name="CreateGig" component={CreateGigScreen} />
            <Stack.Screen name="CreateProject" component={CreateProjectScreen} />
            <Stack.Screen name="SubmitProposal" component={ProposalScreen} />
        </Stack.Navigator>
    );
};

export default MarketplaceNavigator;
