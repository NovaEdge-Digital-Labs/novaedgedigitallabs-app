import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ToolsScreen from '../screens/ToolsScreen';
import RecommendedToolsScreen from '../screens/RecommendedToolsScreen';
import QRGenerator from '../tools/QRGenerator';
import GSTCalculator from '../tools/GSTCalculator';
import EMICalculator from '../tools/EMICalculator';
import ImageCompressor from '../tools/ImageCompressor';
import JSONFormatter from '../tools/JSONFormatter';
import Base64Tool from '../tools/Base64Tool';
import JWTDecoder from '../tools/JWTDecoder';
import RegExTester from '../tools/RegExTester';

const Stack = createNativeStackNavigator();

const ToolsNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ToolsList" component={ToolsScreen} />
            <Stack.Screen name="RecommendedTools" component={RecommendedToolsScreen} />
            <Stack.Screen name="QRGenerator" component={QRGenerator} />
            <Stack.Screen name="GSTCalculator" component={GSTCalculator} />
            <Stack.Screen name="EMICalculator" component={EMICalculator} />
            <Stack.Screen name="ImageCompressor" component={ImageCompressor} />
            <Stack.Screen name="JSONFormatter" component={JSONFormatter} />
            <Stack.Screen name="Base64Tool" component={Base64Tool} />
            <Stack.Screen name="JWTDecoder" component={JWTDecoder} />
            <Stack.Screen name="RegExTester" component={RegExTester} />
        </Stack.Navigator>
    );
};

export default ToolsNavigator;
