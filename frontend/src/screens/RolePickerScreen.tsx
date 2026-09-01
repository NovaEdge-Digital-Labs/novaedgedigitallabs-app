import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    FadeInDown,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/colors';
import { PERSONAS, type PersonaConfig } from '../constants/personas';
import { useAuthStore, type Persona } from '../store/authStore';
import ThemeWrapper from '../components/ThemeWrapper';
import PrimaryButton from '../components/PrimaryButton';

const { width } = Dimensions.get('window');
const CARD_GAP = SPACING.sm;

/**
 * One-screen onboarding picker: "Aap yahan kya karna chahte hain?"
 *
 * Shown once after registration (or for existing users with no `personas` set).
 * Multi-select — the user can pick 1+ roles. On "Continue", calls
 * `savePersonas()` which updates the store (immediate UI re-route) and
 * PUTs to the server (non-blocking).
 *
 * Skipping saves an empty array — Home shows all cards, which is the safe
 * default for a multi-role product.
 */
const RolePickerScreen = () => {
    const [selected, setSelected] = useState<Persona[]>([]);
    const [saving, setSaving] = useState(false);
    const savePersonas = useAuthStore((s) => s.savePersonas);

    const toggle = (key: Persona) => {
        setSelected((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const handleContinue = async () => {
        setSaving(true);
        await savePersonas(selected);
        // Navigation happens automatically — AppNavigator re-renders when
        // user.personas is set.
        setSaving(false);
    };

    const handleSkip = async () => {
        // Empty array = "not specified" — Home shows everything.
        await savePersonas([]);
    };

    return (
        <ThemeWrapper>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <Text style={styles.title}>Aap yahan kya{'\n'}karna chahte hain?</Text>
                    <Text style={styles.subtitle}>
                        Ek ya zyada choose karo — isse Home aur Profile aapke liye personalise ho jayega.
                    </Text>
                </Animated.View>

                {/* Persona Cards */}
                <View style={styles.cardsContainer}>
                    {PERSONAS.map((persona, index) => (
                        <PersonaCard
                            key={persona.key}
                            persona={persona}
                            isSelected={selected.includes(persona.key)}
                            onToggle={() => toggle(persona.key)}
                            index={index}
                        />
                    ))}
                </View>

                {/* CTA */}
                <Animated.View
                    entering={FadeInDown.delay(600).duration(500)}
                    style={styles.ctaContainer}
                >
                    <PrimaryButton
                        title={
                            selected.length === 0
                                ? 'Koi ek choose karo'
                                : selected.length === 1
                                ? 'Aage badho'
                                : `${selected.length} selected — Aage badho`
                        }
                        onPress={handleContinue}
                        disabled={selected.length === 0}
                        loading={saving}
                        style={styles.continueButton}
                    />

                    <TouchableOpacity
                        onPress={handleSkip}
                        style={styles.skipButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.skipText}>Skip — sab kuch dikhao</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </ThemeWrapper>
    );
};

/* ─── Animated Persona Card ─── */

interface PersonaCardProps {
    persona: PersonaConfig;
    isSelected: boolean;
    onToggle: () => void;
    index: number;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isSelected, onToggle, index }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(150 + index * 80).duration(400)}
            style={animatedStyle}
        >
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={onToggle}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                ]}
            >
                {/* Glow border for selected state */}
                {isSelected && (
                    <LinearGradient
                        colors={[COLORS.primary + '40', COLORS.accent + '30', 'transparent']}
                        style={styles.cardGlow}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                )}

                <View style={styles.cardContent}>
                    {/* Icon */}
                    <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                        <Ionicons
                            name={persona.icon as any}
                            size={24}
                            color={isSelected ? COLORS.white : COLORS.textMuted}
                        />
                    </View>

                    {/* Text */}
                    <View style={styles.cardTextContainer}>
                        <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                            {persona.label}
                        </Text>
                        <Text style={styles.cardSubtitle}>{persona.subtitle}</Text>
                    </View>

                    {/* Checkbox */}
                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && (
                            <Ionicons name="checkmark" size={16} color={COLORS.white} />
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

/* ─── Styles ─── */

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xxl,
        paddingBottom: SPACING.xxl,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: COLORS.text,
        lineHeight: 36,
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: 15,
        color: COLORS.textMuted,
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },

    cardsContainer: {
        gap: CARD_GAP,
    },

    /* Card */
    card: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        overflow: 'hidden',
    },
    cardSelected: {
        borderColor: COLORS.primary + '80',
        backgroundColor: 'rgba(145, 39, 255, 0.08)',
    },
    cardGlow: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.15,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
    },

    /* Icon */
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconCircleSelected: {
        backgroundColor: COLORS.primary + '30',
    },

    /* Text */
    cardTextContainer: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 2,
    },
    cardLabelSelected: {
        color: COLORS.white,
    },
    cardSubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        lineHeight: 18,
    },

    /* Checkbox */
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primary,
    },

    /* CTA */
    ctaContainer: {
        marginTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    continueButton: {
        borderRadius: 16,
        height: 56,
    },
    skipButton: {
        marginTop: SPACING.md,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    skipText: {
        fontSize: 14,
        color: COLORS.textMuted,
    },
});

export default RolePickerScreen;
