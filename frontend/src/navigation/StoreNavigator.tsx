import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoreScreen from '../screens/StoreScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

export type StoreStackParamList = {
    StoreMain: undefined;
    ProductDetail: { productId: string; title: string };
};

const Stack = createNativeStackNavigator<StoreStackParamList>();

const StoreNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="StoreMain" component={StoreScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </Stack.Navigator>
    );
};

export default StoreNavigator;
