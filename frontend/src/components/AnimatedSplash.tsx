import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

interface AnimatedSplashProps {
    onAnimationEnd: () => void;
}

const splashVideoSource = require('../../assets/splash-screen.mp4');
const appIconSource = require('../../assets/icon-app.png');

const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ onAnimationEnd }) => {
    const containerOpacity = useRef(new Animated.Value(1)).current;
    const [videoFailed, setVideoFailed] = useState(false);

    const triggerFadeOut = () => {
        Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            onAnimationEnd();
        });
    };

    useEffect(() => {
        // Safety net timer to prevent getting stuck if video events drop
        const timer = setTimeout(() => {
            triggerFadeOut();
        }, 4500);

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return (
        <Animated.View style={[styles.mainWrapper, { opacity: containerOpacity }]}>
            {!videoFailed ? (
                <Video
                    source={splashVideoSource}
                    style={{ width: '100%', height: '100%' }}
                    videoStyle={{ width: '100%', height: '100%', objectFit: 'contain' } as any}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    isMuted
                    isLooping={false}
                    onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded && status.didJustFinish) {
                            triggerFadeOut();
                        }
                        if (!status.isLoaded && status.error) {
                            setVideoFailed(true);
                        }
                    }}
                    onError={() => setVideoFailed(true)}
                />
            ) : (
                <View style={styles.fallbackContainer}>
                    <Image source={appIconSource} style={styles.fallbackIcon} resizeMode="contain" />
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#090c15',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#090c15',
    },
    fallbackIcon: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: 24,
    },
});

export default AnimatedSplash;
