import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image, Platform } from 'react-native';
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

    const triggerFadeOut = () => {
        Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
        }).start(() => {
            onAnimationEnd();
        });
    };

    const player = useVideoPlayer(splashVideoSource, (p) => {
        p.loop = false;
        p.muted = true;
        p.play();
    });

    useEffect(() => {
        const playingSub = player.addListener('playingChange', (isPlaying) => {
            // When video stops playing and it has progressed, it means it finished
            if (!isPlaying && player.currentTime > 0) {
                triggerFadeOut();
            }
        });

        const statusSub = player.addListener('statusChange', (status: any) => {
            const newStatus = typeof status === 'string' ? status : (status?.status || player.status);
            if (newStatus === 'error' || newStatus === 'failed') {
                setVideoFailed(true);
            }
        });

        return () => {
            playingSub?.remove();
            statusSub?.remove();
        };
    }, [player]);

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
                <VideoView
                    player={player}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="contain"
                    nativeControls={false}
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
