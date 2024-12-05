import {ActivityIndicator, FlatList, Image, RefreshControl, Text, View} from 'react-native';
import React, {useState} from 'react';
import images from "@/constants/images";
import SearchInput from "@/components/SearchInput";
import TrendingList from "@/components/TrendingList";
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from "@/components/EmptyState";
import {getAllPosts, getLatestPosts} from "@/lib/appwrite";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";
import VideoCard from "@/components/VideoCard";
import {useGlobalContext} from "@/context/GlobalProvider";

const Home = () => {
  const {user} = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const {data: posts, isLoading: isLoadingPosts, refetch: refetchPosts} = useAppwriteQuery(getAllPosts, []);
  const {data: latestPosts, isLoading: isLoadingLatestPosts, refetch: refetchLatestPosts} = useAppwriteQuery(getLatestPosts, []);

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
        refetchPosts(),
        refetchLatestPosts()
    ])

    setRefreshing(false);
  }

  return (
    <SafeAreaView>
      <FlatList
        data={posts}
        renderItem={({item}) => (
            <VideoCard video={item}/>
        )}
        ListHeaderComponent={() => (
            <View className='my-6 px-4 space-y-6'>
              <View className="justify-between items-start flex-row mb-6">
                <View>
                  <Text className="font-pmedium text-sm text-gray-100">
                    Welcome Back
                  </Text>
                  <Text className="text-2xl font-psemibold text-white mt-2">
                    {user?.username}
                  </Text>
                </View>
                <View className="mt-1.5">
                  <Image
                      source={images.logoSmall}
                      className="w-9 h-10"
                      resizeMode="contain"
                  />
                </View>
              </View>
              <SearchInput
                placeholder="Search for a video topic"
              />
              <View className="w-full flex-1 pt-5 pb-8">
                <Text className="text-gray-100 text-lg font-pregular mb-3">
                  Latest Videos
                </Text>
                <TrendingList data={latestPosts} isLoading={isLoadingLatestPosts}/>
              </View>
            </View>
        )}
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

export default Home;