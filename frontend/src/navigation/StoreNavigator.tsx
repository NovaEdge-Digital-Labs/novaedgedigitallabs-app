import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { stackScreenOptions } from './screenOptions';
import StoreScreen from '../screens/StoreScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type StoreStackParamList = {
    StoreMain: undefined;
    ProductDetail: { productId: string; title: string };
};

const Stack = createStackNavigator<StoreStackParamList>();

const StoreNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                ...stackScreenOptions,
                headerShown: false,
                animationEnabled: true,
            }}
        >
            <Stack.Screen name="StoreMain" component={StoreScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </Stack.Navigator>
    );
};

export default StoreNavigator;
