import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Video } from 'expo-av'; // Or 'react-native-video'

/**
 * PlayerComponent - React Native SVOD Watch-Time Tracking Component
 *
 * @param {string} filmId - Unique identifier of film/episode (e.g. "Raptus_2026")
 * @param {string} userId - Unique identifier of watching user (e.g. "12345-abcde")
 * @param {string} streamUrl - Video source HLS/MP4 URL
 * @param {string} [apiUrl] - Optional custom endpoint URL (defaults to production endpoint)
 */
const PlayerComponent = ({
  filmId,
  userId,
  streamUrl,
  apiUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const timeAccumulator = useRef(0);
  const isPlayingRef = useRef(false);

  // Sync isPlaying state to ref for timer closure access
  useEffect(() => {
    isPlayingRef.current = isPlaying && !isBuffering;
  }, [isPlaying, isBuffering]);

  /**
   * Sends accumulated watch time seconds to backend API
   */
  const syncWatchTime = async () => {
    if (timeAccumulator.current > 0) {
      const timeToLog = timeAccumulator.current;
      timeAccumulator.current = 0; // Reset accumulator immediately before network request

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            film_id: filmId,
            seconds_watched: timeToLog,
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.status) {
          console.warn('Watch time sync returned failure status:', result);
          // Restore un-synced seconds back to accumulator in case of failure
          timeAccumulator.current += timeToLog;
        } else {
          console.log(`[WatchTracker] Logged ${timeToLog} seconds for film ${filmId}`);
        }
      } catch (error) {
        console.error('[WatchTracker] Failed to sync watch time:', error);
        // Restore time in case of network error
        timeAccumulator.current += timeToLog;
      }
    }
  };

  useEffect(() => {
    // Heartbeat 1: Tick accumulator every 1 second when video is actively playing
    const secondCounter = setInterval(() => {
      if (isPlayingRef.current) {
        timeAccumulator.current += 1;
      }
    }, 1000);

    // Heartbeat 2: Sync payload to server every 60 seconds
    const syncInterval = setInterval(() => {
      syncWatchTime();
    }, 60000);

    // Cleanup: Flush pending watch time and clear timers on unmount
    return () => {
      clearInterval(secondCounter);
      clearInterval(syncInterval);
      syncWatchTime();
    };
  }, [filmId, userId, apiUrl]);

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: streamUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="cover"
        shouldPlay
        useNativeControls
        style={styles.video}
        onPlaybackStatusUpdate={(status) => {
          if (!status.isLoaded) return;
          setIsPlaying(status.isPlaying);
          setIsBuffering(status.isBuffering);
        }}
      />
      <View style={styles.overlay}>
        <Text style={styles.statusText}>
          Status: {isPlaying ? (isBuffering ? 'Buffering...' : 'Playing') : 'Paused'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default PlayerComponent;
