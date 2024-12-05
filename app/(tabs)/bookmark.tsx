import {ActivityIndicator, FlatList, RefreshControl, Text, View} from 'react-native';
import React, {useState} from 'react';
import {useGlobalContext} from "@/context/GlobalProvider";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";
import {getAllLikedPosts} from "@/lib/appwrite";
import {SafeAreaView} from "react-native-safe-area-context";
import VideoCard from "@/components/VideoCard";
import EmptyState from "@/components/EmptyState";
import FormField from "@/components/FormField";

const ListHeaderComponent = ([value, setValue]: ReturnType<typeof useState<string>>) => {

  return (
      <View className='my-6 px-4 space-y-6'>
        <View className="justify-between items-start flex-row mb-6">
          <Text className="text-3xl font-psemibold text-white mt-2">
            Saved videos
          </Text>
        </View>
        <FormField
            placeholder="Search through your saved videos"
            label="Search"
            value={value}
            onChangeText={text => setValue(text)}
        />
      </View>
  )
}

const Bookmark = () => {
  const {user} = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const {data: posts, isLoading: isLoadingPosts, refetch: refetchPosts} = useAppwriteQuery(() => getAllLikedPosts(user?.$id), []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPosts();
    setRefreshing(false);
  }

  return (
      <SafeAreaView>
        <FlatList
            data={posts.filter(post => post.title.toLowerCase().includes(searchQuery ? searchQuery?.toLowerCase() : ""))}
            renderItem={({item}) => (
                <VideoCard video={item}/>
            )}
            ListHeaderComponent={ListHeaderComponent([searchQuery, setSearchQuery])}
            ListEmptyComponent={() => (
                isLoadingPosts
                    ? <ActivityIndicator className="text-secondary"/>
                    : <EmptyState
                        title="No videos found"
                        subtitle="No videos found for this search query"
                    />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/> }
        />
      </SafeAreaView>
  )
}

export default Bookmark;