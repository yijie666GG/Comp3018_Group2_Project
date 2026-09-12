import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { useTheme } from '../theme/ThemeContext';

export default function AppearanceScreen() {
    const { mode, setMode, colors } = useTheme();

    const styles = createStyles(colors);

    const options = [
        {
            key: 'light',
            title: 'Light',
            subtitle: 'Always use light mode',
            icon: 'sunny-outline',
        },
        {
            key: 'dark',
            title: 'Dark',
            subtitle: 'Always use dark mode',
            icon: 'moon-outline',
        },
        {
            key: 'system',
            title: 'System',
            subtitle: 'Follow your device appearance',
            icon: 'phone-portrait-outline',
        },
    ] as const;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={22}
                            color={colors.text}
                        />
                    </TouchableOpacity>

                    <Text style={styles.title}>
                        Appearance
                    </Text>

                    <View style={styles.spacer} />
                </View>

                <Text style={styles.description}>
                    Choose how Smart Expense looks on your device.
                </Text>

                <View style={styles.optionsContainer}>
                    {options.map((option) => {
                        const selected = mode === option.key;

                        return (
                            <TouchableOpacity
                                key={option.key}
                                style={[
                                    styles.optionCard,
                                    selected && styles.optionCardSelected,
                                ]}
                                activeOpacity={0.7}
                                onPress={() => setMode(option.key)}
                            >
                                <View style={styles.optionLeft}>
                                    <View
                                        style={[
                                            styles.iconBox,
                                            selected && styles.iconBoxSelected,
                                        ]}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={22}
                                            color={colors.primary}
                                        />
                                    </View>

                                    <View>
                                        <Text style={styles.optionTitle}>
                                            {option.title}
                                        </Text>

                                        <Text style={styles.optionSubtitle}>
                                            {option.subtitle}
                                        </Text>
                                    </View>
                                </View>

                                <View
                                    style={[
                                        styles.radioOuter,
                                        selected && styles.radioOuterSelected,
                                    ]}
                                >
                                    {selected && (
                                        <View style={styles.radioInner} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colors.background,
        },

        content: {
            flex: 1,
            paddingHorizontal: 22,
            paddingTop: 12,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 22,
        },

        backButton: {
            width: 42,
            height: 42,
            borderRadius: 13,
            backgroundColor: colors.softBackground,
            alignItems: 'center',
            justifyContent: 'center',
        },

        title: {
            fontSize: 20,
            fontWeight: '800',
            color: colors.text,
        },

        spacer: {
            width: 42,
        },

        description: {
            fontSize: 13,
            lineHeight: 19,
            color: colors.secondaryText,
            marginBottom: 24,
        },

        optionsContainer: {
            gap: 12,
        },

        optionCard: {
            minHeight: 78,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 17,
            paddingHorizontal: 14,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
        },

        optionCardSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primarySoft,
        },

        optionLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },

        iconBox: {
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.softBackground,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 13,
        },

        iconBoxSelected: {
            backgroundColor: colors.primarySoft,
        },

        optionTitle: {
            fontSize: 15,
            fontWeight: '800',
            color: colors.text,
        },

        optionSubtitle: {
            marginTop: 3,
            fontSize: 11,
            color: colors.secondaryText,
        },

        radioOuter: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
        },

        radioOuterSelected: {
            borderColor: colors.primary,
        },

        radioInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
        },
    });