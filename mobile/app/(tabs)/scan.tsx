import { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function ScanReceipt() {
  const [imageUri, setImageUri] =
    useState<string | null>(null);

  const [isScanning, setIsScanning] =
    useState(false);

  // =========================
  // Camera
  // =========================

  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Camera permission is required."
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 1,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.log(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };

  // =========================
  // Gallery
  // =========================

  const pickImage = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: false,
          quality: 1,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setImageUri(
          result.assets[0].uri
        );
      }
    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        "Gallery Error",
        "Unable to select the image."
      );
    }
  };

  // =========================
  // Test Receipt OCR
  // =========================

  const testScan = async () => {
    try {
      setIsScanning(true);

      const response = await fetch(
        "http://10.0.2.2:3000/api/receipts/test-scan"
      );

      if (!response.ok) {
        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Test scan result:",
        data
      );

      if (!data.success) {
        Alert.alert(
          "Scan Error",
          "Unable to scan test receipt."
        );

        return;
      }

      if (!data.receipt) {
        Alert.alert(
          "Scan Error",
          "No receipt data was returned."
        );

        return;
      }

      router.push({
        pathname: "/receipt-review" as any,
        params: {
          receipt: JSON.stringify(
            data.receipt
          ),
        },
      });
    } catch (error) {
      console.log(
        "Test scan error:",
        error
      );

      Alert.alert(
        "Connection Error",
        "Unable to connect to the OCR backend. Make sure the backend is running on port 3000."
      );
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scan Receipt
      </Text>

      <Text style={styles.subtitle}>
        Take a photo or choose a receipt from your gallery.
      </Text>

      {/* Receipt Preview */}

      <View style={styles.previewArea}>
        {imageUri ? (
          <Image
            source={{
              uri: imageUri,
            }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.emptyPreview}>
            <Ionicons
              name="receipt-outline"
              size={48}
              color="#FFFFFF"
            />

            <Text style={styles.placeholder}>
              No receipt selected
            </Text>
          </View>
        )}
      </View>

      {/* Camera + Gallery */}

      <View style={styles.actionRow}>
        {/* Camera */}

        <View style={styles.actionItem}>
          <Pressable
            style={styles.roundActionButton}
            onPress={openCamera}
          >
            <Ionicons
              name="camera"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.actionLabel}>
            Take Photo
          </Text>
        </View>

        {/* Gallery */}

        <View style={styles.actionItem}>
          <Pressable
            style={styles.roundActionButton}
            onPress={pickImage}
          >
            <Ionicons
              name="images-outline"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.actionLabel}>
            Choose from Gallery
          </Text>
        </View>
      </View>

      {/* Test Receipt Scan */}

      <Pressable
        style={[
          styles.testScanButton,
          isScanning &&
            styles.disabledButton,
        ]}
        onPress={testScan}
        disabled={isScanning}
      >
        <Ionicons
          name="scan-outline"
          size={20}
          color="#FFFFFF"
        />

        <Text style={styles.testScanText}>
          {isScanning
            ? "Scanning..."
            : "Test Receipt Scan"}
        </Text>
      </Pressable>

      {/* Status */}

      {imageUri && (
        <View style={styles.successContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#16A34A"
          />

          <Text style={styles.success}>
            Receipt selected successfully
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#172033",
  },

  subtitle: {
    fontSize: 15,
    color: "#777777",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 25,
  },

  previewArea: {
    width: "100%",
    height: 430,
    backgroundColor: "#111827",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  emptyPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholder: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 12,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  // =========================
  // Camera + Gallery
  // =========================

  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 55,
    marginTop: 22,
  },

  actionItem: {
    alignItems: "center",
    width: 125,
  },

  roundActionButton: {
    width: 78,
    height: 78,
    borderRadius: 39,

    backgroundColor: "#19AFC1",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  actionLabel: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
    color: "#555555",
  },

  // =========================
  // Test Scan
  // =========================

  testScanButton: {
    backgroundColor: "#7C3AED",
    borderRadius: 10,

    marginTop: 18,
    alignSelf: "center",

    paddingVertical: 13,
    paddingHorizontal: 28,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  testScanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.6,
  },

  // =========================
  // Status
  // =========================

  successContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    gap: 6,
  },

  success: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
});