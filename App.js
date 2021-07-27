import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";

import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo,
} from "react-native-twilio-video-webrtc";

import { Camera } from "expo-camera";

import styleSheet from "./styles";

const styles = StyleSheet.create(styleSheet);

export default function App() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [status, setStatus] = useState("disconnected");
  const [participants, setParticipants] = useState(new Map());
  const [videoTracks, setVideoTracks] = useState(new Map());
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [roomname, setRoomname] = useState("");
  const twilioVideo = useRef(null);

  const _onConnectButtonPress = async () => {
    let jwt;
    try {
      const response = await fetch(
        `https://shrouded-peak-59569.herokuapp.com/getToken?userName=${username}`
      );

      if (!response.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      jwt = await response.text();

      // setToken(() => jwt);
    } catch (err) {
      Alert.alert(err.message);
    }

    twilioVideo.current.connect({
      roomName: roomname,
      accessToken: jwt,
      enableNetworkQualityReporting: true,
      dominantSpeakerEnabled: true,
    });
    setStatus("connecting");
  };

  const _onEndButtonPress = () => {
    twilioVideo.current.disconnect();
  };

  const _onMuteButtonPress = () => {
    twilioVideo.current
      .setLocalAudioEnabled(!isAudioEnabled)
      .then((isEnabled) => setIsAudioEnabled(isEnabled));
  };

  const _onFlipButtonPress = () => {
    twilioVideo.current.flipCamera();
  };

  const _onRoomDidConnect = () => {
    setStatus("connected");
  };

  const _onRoomDidDisconnect = ({ error }) => {
    console.log("ERROR: ", error);

    setStatus("disconnected");
  };

  const _onRoomDidFailToConnect = (error) => {
    console.log("ERROR: ", error);

    setStatus("disconnected");
  };

  const _onParticipantAddedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantAddedVideoTrack: ", participant, track);

    setVideoTracks(
      new Map([
        ...videoTracks,
        [
          track.trackSid,
          { participantSid: participant.sid, videoTrackSid: track.trackSid },
        ],
      ])
    );
  };

  const _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantRemovedVideoTrack: ", participant, track);

    const videoTracks = new Map(videoTracks);
    videoTracks.delete(track.trackSid);

    setVideoTracks(videoTracks);
  };

  const _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
    console.log(
      "Participant",
      participant,
      "isLocalUser",
      isLocalUser,
      "quality",
      quality
    );
  };

  const _onDominantSpeakerDidChange = ({ roomName, roomSid, participant }) => {
    console.log(
      "onDominantSpeakerDidChange",
      `roomName: ${roomName}`,
      `roomSid: ${roomSid}`,
      "participant:",
      participant
    );
  };

  const _requestAudioPermission = () => {
    return Camera.requestMicrophonePermissionsAsync();
  };

  const _requestCameraPermission = () => {
    return Camera.requestCameraPermissionsAsync();
  };

  useEffect(() => {
    let isSubscribed = true;

    if (isSubscribed) {
      (async () => {
        try {
          const cameraPermission = await Camera.getCameraPermissionsAsync();
          const microphonePermission =
            await Camera.getMicrophonePermissionsAsync();

          if (cameraPermission.status !== "granted") {
            Alert.alert(
              "Notice",
              "We need to access your camera in order for this app to work.",
              [
                {
                  text: "Request Permissions",
                  onPress: async () => {
                    const { status } = await _requestCameraPermission();

                    if (status !== "granted") {
                      Alert.alert(
                        "Notice",
                        "This app won't properly work by not allowing camera permission."
                      );
                    }
                  },
                },
              ]
            );
          }

          if (microphonePermission.status !== "granted") {
            Alert.alert(
              "Notice",
              "We need to access your microphone in order for this app to work.",
              [
                {
                  text: "Request Permissions",
                  onPress: async () => {
                    const { status } = await _requestAudioPermission();

                    if (status !== "granted") {
                      Alert.alert(
                        "Notice",
                        "This app won't properly work by not allowing microphone permission."
                      );
                    }
                  },
                },
              ]
            );
          }
        } catch (err) {
          console.log(err);
          Alert.alert("Could not retreive camera and audio permissions.");
        }
      })();
    }

    return () => (isSubscribed = false);
  }, []);

  return (
    <View style={styles.container}>
      {status === "disconnected" && (
        <View>
          <Text style={styles.welcome}>React Native Twilio Video</Text>
          <View style={{ marginTop: 16 }}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="User Name"
              value={username}
              onChangeText={(text) => setUsername(text)}
            />
          </View>
          <View style={{ marginTop: 8, marginBottom: 16 }}>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              placeholder="Room Name"
              value={roomname}
              onChangeText={(text) => setRoomname(text)}
            />
          </View>
          <Button
            title="Connect"
            style={styles.button}
            color="black"
            onPress={_onConnectButtonPress}
            disabled={!username || !roomname}
          />
        </View>
      )}

      {(status === "connected" || status === "connecting") && (
        <>
          <Text>status: {status}</Text>
          <View style={styles.callContainer}>
            {status === "connected" && (
              <View style={styles.remoteGrid}>
                {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
                  return (
                    <TwilioVideoParticipantView
                      style={styles.remoteVideo}
                      key={trackSid}
                      trackIdentifier={trackIdentifier}
                    />
                  );
                })}
              </View>
            )}
          </View>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onEndButtonPress}
            >
              <Text style={{ fontSize: 12, color: "white" }}>End</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onMuteButtonPress}
            >
              <Text style={{ fontSize: 12, color: "white" }}>
                {isAudioEnabled ? "Mute" : "Unmute"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={_onFlipButtonPress}
            >
              <Text style={{ fontSize: 12, color: "white" }}>Flip</Text>
            </TouchableOpacity>
            <TwilioVideoLocalView enabled={true} style={styles.localVideo} />
          </View>
        </>
      )}

      <TwilioVideo
        ref={twilioVideo}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
        onNetworkQualityLevelsChanged={_onNetworkLevelChanged}
        onDominantSpeakerDidChange={_onDominantSpeakerDidChange}
      />
    </View>
  );
}
