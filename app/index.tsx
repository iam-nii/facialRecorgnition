import { CameraView, useCameraPermissions, } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [transmitting, setTransmitting] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const intervalRef = useRef<number | null>(null);

  // All hooks must be before conditional returns
  useEffect(() => {
    if (transmitting && cameraReady) {
      // start interval
      console.log("Transmitting...");
      alert("Transmitting...");
      intervalRef.current = setInterval(async () => {
        try {
          const photo = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.1 });
          console.log("Captured frame:", photo?.base64);
          const APIENDPOINT= ""; // Ссылка на API
          const response = await fetch(APIENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: photo?.base64,
    }),
  });


        } catch (error) {
          console.log("Error capturing frame:", error);
        }
      }, 10000);

    } else {
      // Stop interval
      console.log("Interval stopped");
      alert("Transmition stopped")
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [transmitting, cameraReady]);

  const handleTransmission = () => {
    setTransmitting(prev => !prev);
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={"front"} mute={true}
        onCameraReady={() => setCameraReady(true)} />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleTransmission}>
          <Text style={styles.text}>{transmitting ? "Stop Transmission" : "Start Transmission"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 44,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    width: '100%',
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    backgroundColor: '#0f1a2aff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
