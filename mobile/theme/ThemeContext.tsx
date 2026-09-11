import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { useColorScheme } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
    mode: ThemeMode;
    isDark: boolean;
    setMode: (mode: ThemeMode) => Promise<void>;
    colors: typeof lightColors;
};

const lightColors = {
    background: '#FFFFFF',
    surface: '#FBFCFE',
    card: '#FFFFFF',
    text: '#172033',
    secondaryText: '#7A8599',
    mutedText: '#8A94A8',
    border: '#E6EBF3',
    softBackground: '#F3F6FB',
    primary: '#2563EB',
    primarySoft: '#EEF4FF',
    danger: '#DC2626',
    dangerSoft: '#FEF2F2',
};

const darkColors = {
    background: '#0F172A',
    surface: '#111827',
    card: '#1E293B',
    text: '#F8FAFC',
    secondaryText: '#CBD5E1',
    mutedText: '#94A3B8',
    border: '#334155',
    softBackground: '#1E293B',
    primary: '#3B82F6',
    primarySoft: '#1E3A5F',
    danger: '#F87171',
    dangerSoft: '#3F1D24',
};

const ThemeContext = createContext<ThemeContextType | undefined>(
    undefined
);

const STORAGE_KEY = 'smart-expense-theme-mode';

export function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const systemColorScheme = useColorScheme();

    const [mode, setModeState] = useState<ThemeMode>('system');
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedMode = await AsyncStorage.getItem(STORAGE_KEY);

                if (
                    savedMode === 'light' ||
                    savedMode === 'dark' ||
                    savedMode === 'system'
                ) {
                    setModeState(savedMode);
                }
            } catch (error) {
                console.log('Load theme error:', error);
            } finally {
                setLoaded(true);
            }
        };

        loadTheme();
    }, []);

    const setMode = async (newMode: ThemeMode) => {
        try {
            setModeState(newMode);
            await AsyncStorage.setItem(STORAGE_KEY, newMode);
        } catch (error) {
            console.log('Save theme error:', error);
        }
    };

    const isDark =
        mode === 'dark' ||
        (mode === 'system' && systemColorScheme === 'dark');

    const colors = isDark ? darkColors : lightColors;

    const value = useMemo(
        () => ({
            mode,
            isDark,
            setMode,
            colors,
        }),
        [mode, isDark]
    );

    if (!loaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            'useTheme must be used inside ThemeProvider'
        );
    }

    return context;
}