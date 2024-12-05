import {ActivityIndicator, FlatList, Image, RefreshControl, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from "@/components/EmptyState";
import {getUserPosts, signOut} from "@/lib/appwrite";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";
import VideoCard from "@/components/VideoCard";
import {useGlobalContext} from "@/context/GlobalProvider";
import icons from "@/constants/icons";
import InfoBox from "@/components/InfoBox";
import {router} from "expo-router";

const Profile = () => {
  const {user, setUser, setIsLoggedIn} = useGlobalContext();
  const {data: posts, isLoading: isLoadingPosts, refetch} = useAppwriteQuery(() => getUserPosts(user?.$id), []);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace('/sign-in');
  }

  return (
      <SafeAreaView>
        <FlatList
            data={posts}
            renderItem={({item}) => (
                <VideoCard video={item}/>
            )}
            ListHeaderComponent={() => (
                <View className="w-full justify-center items-center mt-6 mb-12 px-4">
                  <TouchableOpacity
                      className="w-full items-end mb-10"
                      onPress={logout}
                  >
                    <Image
                      source={icons.logout}
                      resizeMode="contain"
                      className="w-6 h-6"
                      />
                  </TouchableOpacity>
                  <View className="w-16 h-16 border border-secondary rounded-lg justify-center items-center">
                    <Image
                      source={{uri: user?.avatar}}
                      className="w-[90%] h-[90%] rounded-lg"
                      resizeMode='contain'
                      />
                  </View>
                  <InfoBox
                    title={user?.username}
                    className="mt-5"
                    titleClassName="text-lg"
                  />
                  <View className="mt-10 flex-row">
                    <InfoBox
                        title={(posts.length || 0).toString()}
                        className="mr-10"
                        subtitle="Posts"
                        titleClassName="text-xl"
                    />
                    <InfoBox
                        title={user?.followers.length || 0}
                        subtitle="Followers"
                        titleClassName="text-xl"
                    />
                  </View>
                </View>
            )}
            ListEmptyComponent={() => (
                isLoadingPosts
                    ? <ActivityIndicator className="text-secondary"/>
                    : <EmptyState
                        title="No videos found"
                        subtitle="You have no created videos"
                      />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/> }
        />
      </SafeAreaView>
  )
}

export default Profile;