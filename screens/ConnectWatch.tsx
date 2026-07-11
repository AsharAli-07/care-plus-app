import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBLEContext } from '../ble';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.89;

const ConnectWatch = ({ navigation }: any) => {
  const {
    isScanning,
    isConnected,
    availableDevices,
    watchData,
    scanForDevices,
    connectToDevice,
    disconnect
  } = useBLEContext();

  const [showDeviceModal, setShowDeviceModal] = useState(false);

  const handleScanPress = () => {
    setShowDeviceModal(true);
    scanForDevices();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050f09" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../assets/images/home-bg.jpg")}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,20,10,0.55)", "rgba(5,15,10,0.88)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.glowTop} />

        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <Ionicons
              name={isConnected ? "watch" : "watch-outline"}
              size={60}
              color={isConnected ? "#4ade80" : "#4ade80"}
              style={styles.watchIcon}
            />

<Text style={styles.title}>
  {isConnected ? "Watch Connected" : "No Watch Connected"}
</Text>

<Text style={styles.subtitle}>
  {isConnected
    ? "Please wear it and stay still for a few moments while the sensors calibrate and begin reading your vitals."
    : "Connect your smartwatch to sync health data, monitor vitals, and get real-time alerts."}
</Text>

{!isConnected ? (
  <TouchableOpacity style={styles.button} onPress={handleScanPress}>
    <Text style={styles.buttonText}>Scan for Devices</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity
    style={[styles.button, styles.disconnectButton]}
    onPress={disconnect}
  >
    <Text style={styles.disconnectText}>Disconnect</Text>
  </TouchableOpacity>
)}

            <TouchableOpacity
              style={[styles.button, styles.exploreButton]}
              onPress={() => navigation.replace("BottomTabs")}
            >
              <Text style={styles.buttonText}>Explore Dashboard</Text>
            </TouchableOpacity>
          </View>

          {/* JSON Data Display When Connected */}
          {isConnected && (
            <View style={[styles.card, { marginTop: 20, alignItems: 'flex-start' }]}>
              <Text style={[styles.title, { marginBottom: 25, fontSize: 20 }]}>Live Watch Data (JSON)</Text>
              <View style={styles.jsonContainer}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(watchData, null, 2)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Device Selection Modal */}
        <Modal
          visible={showDeviceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDeviceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Available Devices</Text>
                <TouchableOpacity onPress={() => setShowDeviceModal(false)}>
                  <MaterialCommunityIcons name="close" size={28} color="#999" />
                </TouchableOpacity>
              </View>

              {isScanning && (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="large" color="#4ade80" />
                  <Text style={styles.scanningText}>Scanning for watches...</Text>
                </View>
              )}

              <FlatList
                data={availableDevices}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.deviceItem}
                    onPress={() => {
                      connectToDevice(item.device);
                      setShowDeviceModal(false);
                    }}
                  >
                    <MaterialCommunityIcons name="watch" size={32} color="#4ade80" />
                    <View style={styles.deviceInfo}>
                      <Text style={styles.deviceName}>{item.name || "Unknown"}</Text>
                      <Text style={styles.deviceId}>{item.id}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  !isScanning ? (
                    <View style={styles.emptyList}>
                      <MaterialCommunityIcons name="watch-variant" size={64} color="#999" />
                      <Text style={styles.emptyText}>No devices found</Text>
                      <Text style={styles.emptySubtext}>Make sure your watch is on</Text>
                    </View>
                  ) : null
                }
              />
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute",
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(0,73,39,0.22)",
    pointerEvents: "none",
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(74,222,128,0.3)',
    borderWidth: 1,
    backgroundColor: 'rgba(0, 26, 17, 0.50)',
  },
  watchIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Poppins_500Medium',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#004927ff',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderColor: 'rgba(74,222,128,0.3)',
    borderWidth: 1,
    paddingVertical: 12,
 
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  disconnectText:{
color: "#ef4444"
  },
  disconnectButton: {
    backgroundColor: 'rgba(248,113,113,0.08)',
    borderColor: 'rgba(248,113,113,0.2)',
  },
  exploreButton: {
    marginTop: 20,
  },
  jsonContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 12,
    width: '100%',
  },
  jsonText: {
    color: '#4ade80',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a1a10',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 60,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
  },
  scanningIndicator: {
    padding: 30,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 15,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#aaa',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 30,
      backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,

  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
  
  },
  deviceId: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'Poppins_400Regular',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#ccc',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
    marginTop: 8,
  },
});

export default ConnectWatch;