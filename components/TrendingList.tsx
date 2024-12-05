import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  ViewToken
} from 'react-native';
import React, {useState} from 'react';
import {Post} from "@/types";
import * as Animatable from "react-native-animatable"
import icons from "@/constants/icons";
import {useVideoPlayer, VideoView} from "expo-video";
import {useEvent, useEventListener} from "expo";
import VideoScreen from "@/components/VideoScreen";
import EmptyState from "@/components/EmptyState";

const zoomIn = {
  0: {
    scaleX: 0.9,
    scaleY: 0.9
  },
  1: {
    scaleX: 1.1,
    scaleY: 1.1
  }
}

const zoomOut = {
  0: {
    scaleX: 1.1,
    scaleY: 1.1
  },
  1: {
    scaleX: 0.9,
    scaleY: 0.9
  }
}

interface TrendingItemProps {
  activeItem?: string | null,
  item: Post
}

const TrendingItem = ({activeItem, item}: TrendingItemProps) => {

  return (
      <Animatable.View
        className="mx-3"
        animation={activeItem === item.$id ? zoomIn : zoomOut}
        duration={500}
      >
        <VideoScreen
          video={item.video}
          thumbnail={item.thumbnail}
          className="w-52 h-72 rounded-[35px] my-5"
        />
      </Animatable.View>
  )
}

interface Props extends Omit<FlatListProps<Post>, "keyExtractor" | "renderItem"> {
  isLoading: boolean
}

const TrendingList = ({isLoading, ...props}: Props) => {
  const [activeItem, setActiveItem] = useState(props.data && props.data[0] && props.data[0].$id);

  const viewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken<Post>[]}) => {
    if (viewableItems.length > 0) {
      setActiveItem(viewableItems[0].key);
    }
  }

  return (
    <FlatList
        keyExtractor={(item) => item.$id}
        renderItem={({item}) => (
            <TrendingItem activeItem={activeItem} item={item}/>
        )}
        ListEmptyComponent={() => (
            isLoading && <ActivityIndicator className="text-secondary"/>
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 70
        }}
        contentOffset={{x: 170, y: 0}}
        horizontal
        {...props}
    />
  )
}

export default TrendingList;