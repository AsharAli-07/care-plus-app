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
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useBLEContext } from '../ble';

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
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Connect Watch</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <BlurView intensity={50} tint="dark" style={styles.card}>
            <Ionicons 
              name={isConnected ? "watch" : "watch-outline"} 
              size={80} 
              color={isConnected ? "#4caf50" : "#4ade80"} 
              style={styles.watchIcon} 
            />
            
            <Text style={styles.title}>
              {isConnected ? "Watch Connected" : "No Watch Connected"}
            </Text>
            
            {!isConnected && (
              <Text style={styles.subtitle}>
                Connect your smartwatch to sync health data, monitor vitals, and get real-time alerts.
              </Text>
            )}

            {!isConnected ? (
              <TouchableOpacity style={styles.connectButton} onPress={handleScanPress}>
                <Text style={styles.connectButtonText}>Scan for Devices</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.connectButton, { backgroundColor: '#f44336', borderColor: '#ff7961' }]} onPress={disconnect}>
                <Text style={styles.connectButtonText}>Disconnect</Text>
              </TouchableOpacity>
            )}
          </BlurView>

          {/* JSON Data Display When Connected */}
          {isConnected && (
            <BlurView intensity={50} tint="dark" style={[styles.card, { marginTop: 20, alignItems: 'flex-start' }]}>
              <Text style={[styles.title, { marginBottom: 15, fontSize: 16 }]}>Live Watch Data (JSON)</Text>
              <View style={styles.jsonContainer}>
                <Text style={styles.jsonText}>
                  {JSON.stringify(watchData, null, 2)}
                </Text>
              </View>
            </BlurView>
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
                  <MaterialCommunityIcons name="close" size={28} color="#fff" />
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
                      <MaterialCommunityIcons name="watch-variant" size={64} color="#ccc" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.3)',
    overflow: 'hidden',
  },
  watchIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#aaa',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  connectButton: {
    backgroundColor: '#004927',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.4)',
    width: '100%',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a1a10',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
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
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
  },
  scanningIndicator: {
    padding: 30,
    alignItems: 'center',
  },
  scanningText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#aaa',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,0.2)',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#fff',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
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
