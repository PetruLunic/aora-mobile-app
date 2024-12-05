import {Image, ImageBackground, Text, TouchableOpacity, View, ViewProps} from 'react-native';
import React from 'react';
import {useVideoPlayer, VideoView} from "expo-video";
import icons from "@/constants/icons";
import {useEvent, useEventListener} from "expo";
import {getFilePreview} from "@/lib/appwrite";

interface Props extends ViewProps{
  video: string,
  thumbnail: string
}

const VideoScreen = ({video, thumbnail, className, ...props}: Props) => {
  const player = useVideoPlayer(getFilePreview(video, 'video'), player => {
    player.pause();
  });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  useEventListener(player, 'statusChange', ({status}) => {
    if (status === "idle") { // When player finished the video
      player.replay();
      player.pause();
    }
  })

  return (
    <View
        className={`overflow-hidden ${className}`}
      {...props}
    >
      {isPlaying ? (
          <VideoView
              player={player}
              style={{
                width: '100%',
                height: '100%'
              }}
              allowsFullscreen
              nativeControls
          />
      ) : (
          <TouchableOpacity
              className="relative justify-center items-center"
              activeOpacity={0.7}
              onPress={() => player.play()}
          >
            <ImageBackground
                source={{
                  uri: getFilePreview(thumbnail, 'image')
                }}
                className="h-full w-full shadow-lg shadow-black/40"
                resizeMode="cover"
            />
            <Image
                source={icons.play}
                className="w-12 h-12 absolute"
                resizeMode="contain"
            />
          </TouchableOpacity>
      )}
    </View>
  )
}

export default VideoScreen;