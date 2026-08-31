import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { nativeStackScreenOptions } from './screenOptions';
import ServicesScreen from '../screens/ServicesScreen';
import LeadFormScreen from '../screens/LeadFormScreen';

const Stack = createNativeStackNavigator();

const ServicesNavigator = () => {
    return (
        <Stack.Navigator screenOptions={nativeStackScreenOptions}>
            <Stack.Screen name="ServicesList" component={ServicesScreen} />
            <Stack.Screen name="LeadForm" component={LeadFormScreen} />
        </Stack.Navigator>
    );
};

export default ServicesNavigator;
