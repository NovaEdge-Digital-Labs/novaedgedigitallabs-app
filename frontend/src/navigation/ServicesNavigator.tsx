import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions } from './screenOptions';
import ServicesScreen from '../screens/ServicesScreen';
import LeadFormScreen from '../screens/LeadFormScreen';

const Stack = createStackNavigator();

const ServicesNavigator = () => {
    return (
        <Stack.Navigator screenOptions={stackScreenOptions}>
            <Stack.Screen name="ServicesList" component={ServicesScreen} />
            <Stack.Screen name="LeadForm" component={LeadFormScreen} />
        </Stack.Navigator>
    );
};

export default ServicesNavigator;
