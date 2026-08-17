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

export default function ScanReceipt() {
  const [imageUri, setImageUri] = useState<string | null>(null);

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

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Camera error:", error);

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

      if (!result.canceled && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Gallery error:", error);

      Alert.alert(
        "Gallery Error",
        "Unable to select the image."
      );
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

      {/* Receipt preview */}

      <View style={styles.previewArea}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.placeholder}>
              No receipt selected
            </Text>
          </View>
        )}
      </View>

      {/* Camera */}

      <Pressable
        style={styles.cameraButton}
        onPress={openCamera}
      >
        <Text style={styles.cameraIcon}>
          📷
        </Text>
      </Pressable>

      <Text style={styles.cameraLabel}>
        Take Photo
      </Text>

      {/* Gallery */}

      <Pressable
        style={styles.galleryButton}
        onPress={pickImage}
      >
        <Text style={styles.galleryText}>
          Choose from Gallery
        </Text>
      </Pressable>

      {/* Status */}

      {imageUri && (
        <Text style={styles.success}>
          Receipt selected successfully
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
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
    color: "#ffffff",
    fontSize: 16,
  },

  image: {
    width: "100%",
    height: "100%",
  },

  cameraButton: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 7,
    borderColor: "#dce1ea",
    backgroundColor: "#ffffff",
    alignSelf: "center",
    marginTop: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  cameraIcon: {
    fontSize: 27,
  },

  cameraLabel: {
    textAlign: "center",
    marginTop: 7,
    fontSize: 14,
    color: "#555555",
  },

  galleryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    marginTop: 16,
    alignSelf: "center",
    paddingVertical: 13,
    paddingHorizontal: 28,
  },

  galleryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  success: {
    textAlign: "center",
    marginTop: 14,
    fontSize: 15,
    color: "#16a34a",
    fontWeight: "600",
  },
});