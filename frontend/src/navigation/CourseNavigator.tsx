import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CourseFeedScreen from '../screens/CourseFeedScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import MyCoursesScreen from '../screens/MyCoursesScreen';
import LecturePlayerScreen from '../screens/LecturePlayerScreen';
import { COLORS } from '../constants/colors';

const Stack = createStackNavigator();

const CourseNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.background,
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 0,
                },
                headerTitleStyle: {
                    fontWeight: '700',
                    color: COLORS.text,
                },
                headerTintColor: COLORS.primary,
            }}
        >
            <Stack.Screen
                name="CourseFeed"
                component={CourseFeedScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CourseDetail"
                component={CourseDetailScreen}
                options={{ title: 'Course Details' }}
            />
            <Stack.Screen
                name="MyCourses"
                component={MyCoursesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LecturePlayer"
                component={LecturePlayerScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default CourseNavigator;
