# Video Consultation Implementation with Agora SDK

This document provides a complete guide for implementing video consultations in the TeleMedicine AI Helper application using Agora's Video SDK.

## Overview

The video consultation feature has been implemented using Agora's Web SDK, providing real-time video and audio communication between doctors and patients. The implementation includes:

- Real-time video and audio streaming
- Video/audio controls (mute/unmute, camera on/off)
- Participant management
- Connection status monitoring
- Error handling and recovery
- Responsive UI design

## Setup Instructions

### 1. Install Dependencies

First, install the required Agora SDK package:

```bash
npm install agora-rtc-sdk-ng
```

### 2. Configure Agora App ID

1. Sign up for an Agora account at [https://console.agora.io/](https://console.agora.io/)
2. Create a new project in the Agora Console
3. Copy your App ID from the project settings
4. Update the `.env` file in your project root:

```env
VITE_AGORA_APP_ID=your_agora_app_id_here
```

### 3. Project Structure

The video consultation implementation consists of several key files:

```
src/
├── config/
│   └── agora.ts                    # Agora configuration
├── hooks/
│   ├── useAgoraClient.tsx         # Agora client management
│   └── useVideoConsultation.tsx   # Video consultation logic
├── components/
│   └── video/
│       ├── VideoConsultation.tsx  # Main video component
│       ├── VideoControls.tsx      # Video controls UI
│       └── ParticipantVideo.tsx   # Individual participant video
├── pages/
│   └── consultation/
│       └── ConsultationPage.tsx   # Updated consultation page
└── types/
    └── index.ts                   # Updated type definitions
```

## Key Components

### 1. VideoConsultation Component

The main component that orchestrates the entire video consultation experience:

- Manages Agora client initialization
- Handles participant video streams
- Provides error handling and status updates
- Responsive grid layout for multiple participants

### 2. VideoControls Component

Provides user interface controls for:

- Audio mute/unmute
- Video on/off
- Connection/disconnection
- Screen sharing (optional)
- Settings panel

### 3. ParticipantVideo Component

Renders individual participant video streams with:

- Video track playback
- Audio/video status indicators
- Participant information overlay
- Role-based styling (doctor/patient)

## Usage

### Basic Implementation

```tsx
import VideoConsultation from '../components/video/VideoConsultation';

function ConsultationPage() {
  const consultationId = "consultation_123";
  
  return (
    <VideoConsultation
      consultationId={consultationId}
      autoStart={false}
      onError={(error) => console.error('Video error:', error)}
      onParticipantCountChange={(count) => console.log('Participants:', count)}
    />
  );
}
```

### Advanced Configuration

The Agora configuration can be customized in `src/config/agora.ts`:

```typescript
export const AGORA_CONFIG = {
  APP_ID: import.meta.env.VITE_AGORA_APP_ID,
  VIDEO_PROFILE: {
    width: 640,
    height: 480,
    frameRate: 15,
    bitrateMin: 200,
    bitrateMax: 1000,
  },
  AUDIO_PROFILE: {
    sampleRate: 48000,
    bitrate: 48,
    stereo: false,
  },
};
```

## Features

### 1. Real-time Video Communication

- HD video streaming with configurable quality
- Automatic codec selection (VP8 recommended)
- Adaptive bitrate based on network conditions

### 2. Audio Management

- High-quality audio streaming
- Echo cancellation and noise suppression
- Automatic gain control

### 3. Connection Management

- Automatic reconnection on network issues
- Connection status monitoring
- Graceful error handling

### 4. User Interface

- Responsive design for desktop and mobile
- Intuitive controls with visual feedback
- Participant status indicators
- Chat integration alongside video

## API Reference

### VideoConsultation Props

| Prop | Type | Description |
|------|------|-------------|
| `consultationId` | `string` | Unique identifier for the consultation session |
| `autoStart` | `boolean` | Whether to automatically start the video call |
| `onError` | `(error: string) => void` | Error callback function |
| `onParticipantCountChange` | `(count: number) => void` | Participant count change callback |

### VideoSession Interface

```typescript
interface VideoSession {
  channelName: string;
  token?: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isConnected: boolean;
  participants: VideoParticipant[];
}
```

### VideoParticipant Interface

```typescript
interface VideoParticipant {
  uid: string | number;
  userId: string;
  name: string;
  role: UserRole;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  joinedAt: string;
}
```

## Security Considerations

### 1. Token Authentication

For production environments, implement token-based authentication:

```typescript
// Generate token on your backend
const token = await generateAgoraToken(channelName, uid);

// Use token when joining channel
await joinChannel(channelName, uid, token);
```

### 2. Channel Security

- Use unique, unpredictable channel names
- Implement proper access control
- Monitor and log all video sessions

### 3. Data Privacy

- Ensure HIPAA compliance for medical consultations
- Implement end-to-end encryption where required
- Secure storage of consultation recordings

## Troubleshooting

### Common Issues

1. **Camera/Microphone Access Denied**
   - Ensure HTTPS is used (required for media access)
   - Check browser permissions
   - Verify device availability

2. **Connection Failed**
   - Verify Agora App ID configuration
   - Check network connectivity
   - Ensure firewall allows WebRTC traffic

3. **Poor Video Quality**
   - Adjust video profile settings
   - Check network bandwidth
   - Optimize encoder configuration

### Debug Mode

Enable debug logging by setting:

```typescript
// In development
AgoraRTC.setLogLevel(0); // Enable all logs
```

## Performance Optimization

### 1. Video Quality

- Use appropriate resolution for device capabilities
- Implement adaptive bitrate streaming
- Optimize for mobile devices

### 2. Network Efficiency

- Enable simulcast for multiple participants
- Use audio-only mode when video isn't needed
- Implement bandwidth detection

### 3. Resource Management

- Properly dispose of video tracks
- Clean up event listeners
- Manage memory usage for long sessions

## Testing

### Unit Tests

Test individual components and hooks:

```bash
npm run test
```

### Integration Tests

Test video consultation flow:

```bash
npm run test:integration
```

### Manual Testing

1. Test with multiple browsers
2. Verify mobile compatibility
3. Test network interruption scenarios
4. Validate audio/video quality

## Deployment

### Environment Variables

Ensure production environment has:

```env
VITE_AGORA_APP_ID=your_production_app_id
```

### Build Configuration

```bash
npm run build
```

### HTTPS Requirement

Video consultations require HTTPS in production for:
- Camera and microphone access
- WebRTC functionality
- Security compliance

## Support and Resources

- [Agora Documentation](https://docs.agora.io/en/)
- [Agora Web SDK API Reference](https://api-ref.agora.io/en/video-sdk/web/4.x/)
- [Agora Community](https://github.com/AgoraIO-Community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/agora.io)

## License

This implementation follows the same license as the main project.
