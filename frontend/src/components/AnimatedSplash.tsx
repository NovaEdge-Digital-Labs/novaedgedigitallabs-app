import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
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

    const player = useVideoPlayer(splashVideoSource, (p) => {
        p.loop = false;
        p.play();
    });

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
        const subscription = player.addListener('playToEnd', () => {
            triggerFadeOut();
        });

        // Safety net timer to prevent getting stuck if video events drop
        const timer = setTimeout(() => {
            triggerFadeOut();
        }, 4200);

        return () => {
            subscription.remove();
            clearTimeout(timer);
        };
    }, [player]);

    return (
        <Animated.View style={[styles.mainWrapper, { opacity: containerOpacity }]}>
            {!videoFailed ? (
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    nativeControls={false}
                    // @ts-ignore
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
        backgroundColor: '#0a0a0f',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0a0a0f',
    },
    fallbackIcon: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: 24,
    },
});

export default AnimatedSplash;
