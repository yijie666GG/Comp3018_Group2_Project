import { useState } from "react";
import { API_URL } from "../../config/api";

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
  // Upload Receipt To Backend
  // =========================

  const scanUploadedReceipt = async (
    imageUri: string,
    fileName: string = "receipt.jpg",
    mimeType: string = "image/jpeg"
  ) => {
    try {
      setIsScanning(true);

      const formData = new FormData();

      formData.append(
        "receipt",
        {
          uri: imageUri,
          name: fileName,
          type: mimeType,
        } as any
      );

      console.log(
        "Uploading receipt:"
      );

      console.log(
        "URI:",
        imageUri
      );

      console.log(
        "File name:",
        fileName
      );

      console.log(
        "Mime type:",
        mimeType
      );

      const response = await fetch(
        `${API_URL}/api/receipts/scan`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.log(
          "Backend response:",
          response.status,
          errorText
        );

        throw new Error(
          `Backend returned status ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Receipt scan result:",
        data
      );

      if (!data.success) {
        Alert.alert(
          "Scan Error",
          data.message ??
            "Unable to scan receipt."
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
        pathname:
          "/receipt-review" as any,

        params: {
          receipt: JSON.stringify(
            data.receipt
          ),
        },
      });
    } catch (error) {
      console.log(
        "Receipt upload error:",
        error
      );

      Alert.alert(
        "Scan Error",
        "Unable to upload or scan the receipt."
      );
    } finally {
      setIsScanning(false);
    }
  };

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
          quality: 0.8,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const asset =
          result.assets[0];

        console.log(
          "Camera result:",
          asset
        );

        setImageUri(
          asset.uri
        );

        await scanUploadedReceipt(
          asset.uri,
          asset.fileName ??
            `camera-receipt-${Date.now()}.jpg`,
          asset.mimeType ??
            "image/jpeg"
        );
      }
    } catch (error) {
      console.log(
        "Camera error:",
        error
      );

      Alert.alert(
        "Camera Error",
        "Unable to open or scan the receipt."
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
        const uri =
          result.assets[0].uri;

        setImageUri(uri);

        await scanUploadedReceipt(
          uri
        );
      }
    } catch (error) {
      console.log(
        "Gallery error:",
        error
      );

      Alert.alert(
        "Gallery Error",
        "Unable to select or scan the image."
      );
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Scan Receipt
      </Text>

      <Text style={styles.subtitle}>
        Take a photo or choose a receipt from your gallery.
      </Text>

      {/* =========================
          Receipt Preview
      ========================= */}

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
          <View
            style={
              styles.emptyPreview
            }
          >
            <Ionicons
              name="receipt-outline"
              size={48}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.placeholder
              }
            >
              No receipt selected
            </Text>
          </View>
        )}

        {/* Scanning Overlay */}

        {isScanning && (
          <View
            style={
              styles.scanningOverlay
            }
          >
            <Ionicons
              name="scan-outline"
              size={42}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.scanningText
              }
            >
              Scanning receipt...
            </Text>
          </View>
        )}
      </View>

      {/* =========================
          Camera + Gallery
      ========================= */}

      <View style={styles.actionRow}>
        {/* Camera */}

        <View style={styles.actionItem}>
          <Pressable
            style={[
              styles.roundActionButton,
              isScanning &&
                styles.disabledButton,
            ]}
            onPress={
              openCamera
            }
            disabled={
              isScanning
            }
          >
            <Ionicons
              name="camera"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={
              styles.actionLabel
            }
          >
            Take Photo
          </Text>
        </View>

        {/* Gallery */}

        <View style={styles.actionItem}>
          <Pressable
            style={[
              styles.roundActionButton,
              isScanning &&
                styles.disabledButton,
            ]}
            onPress={
              pickImage
            }
            disabled={
              isScanning
            }
          >
            <Ionicons
              name="images-outline"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={
              styles.actionLabel
            }
          >
            Choose from Gallery
          </Text>
        </View>
      </View>

      {/* =========================
          Status
      ========================= */}

      {imageUri &&
        !isScanning && (
          <View
            style={
              styles.successContainer
            }
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#16A34A"
            />

            <Text
              style={
                styles.success
              }
            >
              Receipt selected successfully
            </Text>
          </View>
        )}
    </View>
  );
}

// =========================
// Styles
// =========================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FFFFFF",
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

    // =========================
    // Receipt Preview
    // =========================

    previewArea: {
      width: "100%",
      height: 430,

      backgroundColor:
        "#111827",

      borderRadius: 24,

      justifyContent:
        "center",

      alignItems:
        "center",

      overflow:
        "hidden",

      position:
        "relative",
    },

    emptyPreview: {
      flex: 1,

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    placeholder: {
      color:
        "#FFFFFF",

      fontSize:
        16,

      marginTop:
        12,
    },

    image: {
      width:
        "100%",

      height:
        "100%",
    },

    // =========================
    // Scanning Overlay
    // =========================

    scanningOverlay: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        "rgba(17,24,39,0.78)",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    scanningText: {
      color:
        "#FFFFFF",

      fontSize:
        16,

      fontWeight:
        "600",

      marginTop:
        12,
    },

    // =========================
    // Camera + Gallery
    // =========================

    actionRow: {
      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "flex-start",

      gap:
        55,

      marginTop:
        22,
    },

    actionItem: {
      alignItems:
        "center",

      width:
        125,
    },

    roundActionButton: {
      width:
        78,

      height:
        78,

      borderRadius:
        39,

      backgroundColor:
        "#2563EB",

      justifyContent:
        "center",

      alignItems:
        "center",

      shadowColor:
        "#000000",

      shadowOpacity:
        0.15,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        5,
    },

    actionLabel: {
      textAlign:
        "center",

      marginTop:
        8,

      fontSize:
        14,

      color:
        "#555555",
    },

    // =========================
    // Disabled
    // =========================

    disabledButton: {
      opacity:
        0.55,
    },

    // =========================
    // Status
    // =========================

    successContainer: {
      flexDirection:
        "row",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginTop:
        14,

      gap:
        6,
    },

    success: {
      fontSize:
        15,

      color:
        "#16A34A",

      fontWeight:
        "600",
    },
  });