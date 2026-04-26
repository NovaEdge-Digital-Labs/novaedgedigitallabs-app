import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    StatusBar
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

const LecturePlayerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { videoUrl } = route.params;

    const player = useVideoPlayer(videoUrl, (player) => {
        player.loop = false;
        player.play();
    });

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.videoWrapper}>
                <VideoView
                    player={player}
                    style={styles.video}
                    nativeControls={true}
                />
            </View>


            <View style={styles.controlsHint}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.gray[400]} />
                <Text style={styles.hintText}>Use native player controls for playback speed and quality.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: width,
        height: width * (9 / 16), // 16:9 Aspect Ratio
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    controlsHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    hintText: {
        color: COLORS.gray[400],
        fontSize: 12,
        marginLeft: 8,
    }
});

export default LecturePlayerScreen;
