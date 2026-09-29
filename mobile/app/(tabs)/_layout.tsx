import { Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useTheme } from '../../theme/ThemeContext';

/**
 * Main bottom tab navigation layout.
 *
 * This layout provides navigation between:
 * Home, Items, Scan, Summary and Account.
 *
 * The Scan tab uses a custom raised camera button
 * to make the receipt scanning function easier to access.
 */
export default function TabLayout() {
  // Get the current theme colours.
  // These colours automatically change based on the selected theme.
  const { colors } = useTheme();

  // Create styles using the current theme colours.
  const styles = createStyles(colors);

  return (
    <Tabs
      screenOptions={{
        // Hide the default header for all tab screens.
        headerShown: false,

        // Tab icon and text colours.
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,

        // Main bottom navigation bar styling.
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },

        // Styling for tab labels.
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
      }}
    >
      {/* Home tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home-outline"
              size={25}
              color={color}
            />
          ),
        }}
      />

      {/* Items tab - displays receipt/expense items */}
      <Tabs.Screen
        name="items"
        options={{
          title: 'Items',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="list-outline"
              size={27}
              color={color}
            />
          ),
        }}
      />

      {/*
        Scan tab.

        This tab uses a custom button instead of the standard
        tab icon. The button is raised above the navigation bar
        so that receipt scanning is the main action.
      */}
      <Tabs.Screen
        name="scan"
        options={{
          title: '',

          // Hide the text label under the Scan button.
          tabBarLabel: () => null,

          // Custom camera button for the Scan screen.
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={props.onPress}
              style={styles.cameraButtonContainer}
            >
              <View style={styles.cameraButton}>
                <Ionicons
                  name="camera"
                  size={30}
                  color="#FFFFFF"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* Summary tab - displays expense summaries and charts */}
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="pie-chart-outline"
              size={25}
              color={color}
            />
          ),
        }}
      />

      {/* Account tab - user account and related settings */}
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="person-circle-outline"
              size={27}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

/**
 * Creates styles for the tab navigation.
 *
 * The styles use theme colours so the navigation
 * remains consistent with the rest of the application.
 */
const createStyles = (colors: any) =>
  StyleSheet.create({
    // Container used to centre the custom Scan button.
    cameraButtonContainer: {
      flex: 1,
      alignItems: 'center',
    },

    // Raised circular camera button in the centre of the tab bar.
    cameraButton: {
      position: 'absolute',
      top: -22,

      width: 66,
      height: 66,

      borderRadius: 22,

      backgroundColor: colors.primary,

      justifyContent: 'center',
      alignItems: 'center',

      // Border separates the button from the tab bar.
      borderWidth: 6,
      borderColor: colors.card,

      // Shadow for iOS.
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,

      // Shadow for Android.
      elevation: 8,
    },
  });