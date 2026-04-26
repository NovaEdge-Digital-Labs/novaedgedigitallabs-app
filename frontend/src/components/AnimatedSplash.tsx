import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
    onAnimationEnd: () => void;
}

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onAnimationEnd }) => {
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const titleY = useRef(new Animated.Value(20)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Main Animation Sequence
        Animated.sequence([
            // Stage 1: Logo enters
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
            // Stage 2: Title and Subtitle appear
            Animated.stagger(300, [
                Animated.parallel([
                    Animated.timing(titleOpacity, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(titleY, {
                        toValue: 0,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // Hold
            Animated.delay(1000),
            // Stage 3: Logo Pulse
            Animated.sequence([
                Animated.timing(logoScale, {
                    toValue: 1.05,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(500),
            // Stage 4: Fade out everything
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onAnimationEnd();
        });
    }, []);

    const [bgStart, bgEnd] = COLORS.getGradient(COLORS.backgroundGradient);

    return (
        <Animated.View style={[styles.mainWrapper, { opacity: containerOpacity }]}>
            <LinearGradient
                colors={[bgStart, bgEnd]}
                style={styles.container}
            >
                <Animated.View
                    style={[
                        styles.logoWrapper,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                            ...COLORS.getGlow(COLORS.primary, 30, 0.3),
                        },
                    ]}
                >
                    <Image
                        source={require('../../assets/icon.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                <View style={styles.textContainer}>
                    <Animated.Text
                        style={[
                            styles.title,
                            {
                                opacity: titleOpacity,
                                transform: [{ translateY: titleY }],
                            },
                        ]}
                    >
                        NOVAEDGE
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.subtitle,
                            {
                                opacity: subtitleOpacity,
                            },
                        ]}
                    >
                        Digital Labs
                    </Animated.Text>
                </View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoWrapper: {
        width: width * 0.32,
        height: width * 0.32,
        marginBottom: 30,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: '80%',
        height: '80%',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 4,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.primary,
        letterSpacing: 6,
        marginTop: 8,
        textTransform: 'uppercase',
    },
});

export default AnimatedSplash;
