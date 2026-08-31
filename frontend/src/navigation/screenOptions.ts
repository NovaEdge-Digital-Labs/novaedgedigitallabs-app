import { StackNavigationOptions } from '@react-navigation/stack';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';

/**
 * Shared options for every stack in the app.
 *
 * `flex: 1` on cardStyle is load-bearing on web: @react-navigation/stack's
 * CardContent styles the card as `{ minHeight: '100%' }` with no flex, so the
 * card grows to its content instead of filling the viewport. Every ScrollView
 * inside then inherits an unbounded height and nothing scrolls. cardStyle is
 * merged after that base style, so this overrides it.
 */
export const stackScreenOptions: StackNavigationOptions = {
    headerShown: false,
    cardStyle: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
};

export default stackScreenOptions;

/**
 * native-stack has no CardContent, so it needs no flex workaround — it takes
 * `contentStyle` rather than `cardStyle`.
 */
export const nativeStackScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    contentStyle: {
        backgroundColor: COLORS.background,
    },
};
