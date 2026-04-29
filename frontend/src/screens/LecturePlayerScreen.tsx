import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    useWindowDimensions,
    ActivityIndicator as RNActivityIndicator,
    Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { CONFIG } from '../constants/config';


const { width: INITIAL_WIDTH } = Dimensions.get('window');

const getYouTubeID = (url: string) => {
    if (!url) return null;
    try {
        // Robust regex covering most YouTube URL formats including /live/ and shorts
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        if (match && match[1]) return match[1];
        
        // Fallback for direct ID strings
        if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) return url;
    } catch (e) {
        console.error('Error extracting YouTube ID:', e);
    }
    return null;
};

const LecturePlayerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { width: windowWidth } = useWindowDimensions();
    
    // Safety check for route params
    const params = route.params || {};
    const rawVideoUrl = params.videoUrl;
    const title = params.title;
    
    // Use windowWidth with fallback to INITIAL_WIDTH, and then a hardcoded fallback
    const currentWidth = windowWidth > 0 ? windowWidth : (INITIAL_WIDTH > 0 ? INITIAL_WIDTH : 375);
    const videoHeight = Math.max(currentWidth * (9 / 16), 200); // Minimum height of 200px

    // Normalize URL
    const videoUrl = React.useMemo(() => {
        if (!rawVideoUrl) return null;
        let trimmed = String(rawVideoUrl).trim();
        
        // If it already has a protocol, return it
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return trimmed;
        }
        
        // If it's a youtube link without protocol
        if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
            return `https://${trimmed}`;
        }
        
        // Otherwise treat as a relative path from our server
        const base = CONFIG.BASE_URL.endsWith('/') ? CONFIG.BASE_URL.slice(0, -1) : CONFIG.BASE_URL;
        const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
        return `${base}${path}`;
    }, [rawVideoUrl]);

    console.log('LecturePlayerScreen: Final Video URL:', videoUrl);
    
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(videoUrl ? 'loading' : 'error');
    const [error, setError] = useState<string | null>(videoUrl ? null : 'No video URL provided.');

    const isYouTube = videoUrl ? (
        videoUrl.includes('youtube.com') || 
        videoUrl.includes('youtu.be') || 
        videoUrl.includes('youtube.com/live')
    ) : false;
    
    const youtubeId = isYouTube ? getYouTubeID(videoUrl!) : null;

    // Detailed logging for debugging
    useEffect(() => {
        console.log('LecturePlayerScreen State:', {
            videoUrl,
            isYouTube,
            youtubeId,
            status,
            error
        });
    }, [videoUrl, isYouTube, youtubeId, status, error]);

    // Loading timeout to prevent stuck spinner
    useEffect(() => {
        let timeout: any;
        if (status === 'loading') {
            timeout = setTimeout(() => {
                if (status === 'loading') {
                    console.warn('LecturePlayerScreen: Loading timed out after 15s');
                    setStatus('error');
                    setError('Loading taking too long. Please check your connection.');
                }
            }, 15000);
        }
        return () => clearTimeout(timeout);
    }, [status]);

    useEffect(() => {
        if (isYouTube && !youtubeId && videoUrl) {
            console.error('LecturePlayerScreen: Failed to extract YouTube ID:', videoUrl);
            setStatus('error');
            setError('Invalid YouTube link format.');
        }
    }, [isYouTube, youtubeId, videoUrl]);

    const player = useVideoPlayer(!isYouTube ? videoUrl : null, (p) => {
        p.loop = false;
        if (videoUrl && !isYouTube) {
            console.log('expo-video: Initializing native player');
            p.play();
        }
    });

    useEffect(() => {
        if (isYouTube) return;

        const handleStatusChange = (payload: any) => {
            const newStatus = typeof payload === 'string' ? payload : (payload?.status || player.status);
            console.log('expo-video: Status change event:', newStatus);
            
            if (newStatus === 'readyToPlay' || newStatus === 'playing') {
                setStatus('ready');
                setError(null);
            } else if (newStatus === 'error' || newStatus === 'failed') {
                console.error('expo-video: Playback error payload:', payload);
                setStatus('error');
                setError('Failed to load video. Please try again.');
            }
        };

        if (player.status === 'readyToPlay' || player.status === 'playing') {
            console.log('expo-video: Player already ready');
            setStatus('ready');
        }

        const statusSub = player.addListener('statusChange', handleStatusChange);
        return () => {
            if (statusSub) statusSub.remove();
        };
    }, [player, isYouTube]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            
            {/* Overlay Header */}
            <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'transparent']}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Lecture Player'}</Text>
                    <Text style={styles.headerSubtitle}>NovaEdge Digital Labs</Text>
                </View>
            </LinearGradient>

            <View style={styles.videoWrapper}>
                {isYouTube ? (
                    <View style={[
                        styles.youtubeContainer, 
                        { 
                            width: currentWidth, 
                            height: videoHeight, 
                            backgroundColor: '#000',
                            borderWidth: 1,
                            borderColor: '#333'
                        }
                    ]}>
                        {Platform.OS === 'web' ? (
                            <View style={{ width: '100%', height: '100%', position: 'relative' }}>
                                {youtubeId ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                        onLoad={() => {
                                            console.log('YouTube Web: iframe loaded');
                                            setStatus('ready');
                                        }}
                                    />
                                ) : (
                                    <View style={styles.errorContainer}>
                                        <Text style={styles.errorText}>Invalid YouTube ID</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <YoutubePlayer
                                key={youtubeId || 'no-id'}
                                height={videoHeight}
                                width={currentWidth}
                                play={true}
                                videoId={youtubeId || ''}
                                onReady={() => {
                                    console.log('YouTube: Ready event');
                                    setStatus('ready');
                                }}
                                onChangeState={(state) => {
                                    console.log('YouTube: State changed:', state);
                                    if (state === 'playing') setStatus('ready');
                                    if (state === 'buffering') setStatus('loading');
                                }}
                                onError={(e) => {
                                    console.error('YouTube: Playback error:', e);
                                    setStatus('error');
                                    setError('YouTube playback error: ' + JSON.stringify(e));
                                }}
                            />
                        )}
                    </View>
                ) : (
                    <VideoView
                        player={player}
                        style={{ width: currentWidth, height: videoHeight, backgroundColor: '#111' }}
                        nativeControls={true}
                        contentFit="contain"
                        onReadyForDisplay={() => {
                            console.log('expo-video: Ready for display');
                            setStatus('ready');
                        }}
                    />
                )}

                {/* Debug Ready State Indicator (Subtle) */}
                {status === 'ready' && (
                    <View style={{ position: 'absolute', top: 10, right: 10, padding: 4, backgroundColor: 'rgba(0,255,0,0.2)', borderRadius: 4 }}>
                        <Text style={{ color: '#0F0', fontSize: 8 }}>Ready</Text>
                    </View>
                )}

                {/* Overlays */}
                {status === 'loading' && (
                    <View style={styles.loaderOverlay}>
                        <RNActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Preparing content...</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 10 }}>
                            {isYouTube ? `YouTube ID: ${youtubeId || 'Extracting...'}` : 'Native Player'}
                        </Text>
                    </View>
                )}

                {status === 'error' && (
                    <View style={[styles.loaderOverlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
                        <Text style={styles.errorText}>{error || 'Unable to play video'}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 5, textAlign: 'center', paddingHorizontal: 20 }}>
                            URL: {videoUrl || 'None'}
                        </Text>
                        <TouchableOpacity 
                            style={styles.retryBtn}
                            onPress={() => {
                                console.log('LecturePlayerScreen: Retrying...');
                                setError(null);
                                setStatus('loading');
                                if (!isYouTube && videoUrl) {
                                    player.replace(videoUrl);
                                    player.play();
                                }
                            }}
                        >
                            <Text style={styles.retryBtnText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Bottom Info Overlay */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.footerInfo}
            >
                <View style={styles.controlsHint}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                    <Text style={styles.hintText}>
                        {isYouTube ? 'Streaming via YouTube' : 'Secure HD Playback'}
                    </Text>
                </View>
            </LinearGradient>
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
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitleContainer: {
        marginLeft: 15,
        flex: 1,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        marginTop: 2,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoWrapper: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 250, // Ensure it has some height even if flex fails
    },
    youtubeContainer: {
        backgroundColor: '#000',
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    loadingText: {
        color: '#FFF',
        fontSize: 14,
        marginTop: 15,
        opacity: 0.8,
    },
    errorText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 40,
    },
    retryBtn: {
        marginTop: 25,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    footerInfo: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        paddingTop: 40,
    },
    controlsHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginLeft: 8,
    }
});


export default LecturePlayerScreen;
