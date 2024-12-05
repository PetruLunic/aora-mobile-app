import {ActivityIndicator, FlatList, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import SearchInput from "@/components/SearchInput";
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from "@/components/EmptyState";
import {searchPosts} from "@/lib/appwrite";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";
import VideoCard from "@/components/VideoCard";
import {useLocalSearchParams} from "expo-router";

const Search = () => {
  const {query} = useLocalSearchParams();
  const {data: posts, isLoading: isLoadingPosts, refetch: refetchPosts} = useAppwriteQuery(() => searchPosts(query.toString()), []);

  useEffect(() => {
    refetchPosts();
  }, [query]);

  return (
      <SafeAreaView>
        <FlatList
            data={posts}
            renderItem={({item}) => (
                <VideoCard video={item}/>
            )}
            ListHeaderComponent={() => (
                <View className='my-6 px-4'>
                  <Text className="font-pmedium text-sm text-gray-100">
                    Searching Results
                  </Text>
                  <Text className="text-2xl font-psemibold text-white">
                    {query}
                  </Text>
                  <SearchInput
                      className="mt-6 mb-8"
                      placeholder="Search for a video topic"
                  />
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
        />
      </SafeAreaView>
  )
}

export default Search;