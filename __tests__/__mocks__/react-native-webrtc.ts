// Mock for react-native-webrtc
export class RTCPeerConnection {
  ontrack: any = null;
  localDescription: any = null;
  
  addTrack = jest.fn();
  createDataChannel = jest.fn(() => ({
    onopen: null,
    onclose: null,
    onmessage: null,
    readyState: "open",
    send: jest.fn(),
    close: jest.fn(),
  }));
  createOffer = jest.fn(async () => ({ type: "offer", sdp: "mock-sdp-offer" }));
  setLocalDescription = jest.fn(async () => {});
  setRemoteDescription = jest.fn(async () => {});
  close = jest.fn();
}

export class RTCSessionDescription {
  type: string;
  sdp: string;
  constructor({ type, sdp }: { type: string; sdp: string }) {
    this.type = type;
    this.sdp = sdp;
  }
}

export const mediaDevices = {
  getUserMedia: jest.fn(async () => ({
    getAudioTracks: () => [{ stop: jest.fn() }],
    getTracks: () => [{ stop: jest.fn() }],
  })),
};

export class MediaStream {}
