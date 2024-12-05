import {ActivityIndicator, FlatList, Image, RefreshControl, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {followUser, getUser, getUserPosts, unfollowUser} from "@/lib/appwrite";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";
import VideoCard from "@/components/VideoCard";
import InfoBox from "@/components/InfoBox";
import {useLocalSearchParams} from "expo-router";
import CustomButton from "@/components/CustomButton";
import {useGlobalContext} from "@/context/GlobalProvider";
import useAppwriteMutation from "@/hooks/useAppwriteMutation";

const Profile = () => {
  const {userId} = useLocalSearchParams();
  const {user: sessionUser} = useGlobalContext();
  const [refreshing, setRefreshing] = useState(false);
  const {data: posts, isLoading: isLoadingPosts, refetch: refetchPosts} = useAppwriteQuery(() => getUserPosts(userId.toString()), []);
  const {data: user, isLoading: isLoadingUser, refetch: refetchUser} = useAppwriteQuery(() => getUser(userId.toString()), null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followTrigger, { isLoading: isLoadingFollowing}] = useAppwriteMutation(() => followUser(userId.toString()), null);
  const [unfollowTrigger, { isLoading: isLoadingUnfollowing}] = useAppwriteMutation(() => unfollowUser(userId.toString()), null);

  useEffect(() => {
    if (!user) return;

    setIsFollowed(user.followers.some(id => sessionUser?.$id === id));
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);

    await Promise.all([
        refetchPosts(),
        refetchUser()
    ]);

    setRefreshing(false);
  }

  const onFollow = async () => {
    if (isFollowed) {
      await unfollowTrigger();
    } else {
      await followTrigger();
    }

    setIsFollowed(prev => !prev);
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
                  {isLoadingUser
                    ? (
                          <ActivityIndicator size='large' className="text-secondary"/>
                      )
                    : (
                        user &&
                        <>
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
                                title={user.followers.length.toString()}
                                subtitle="Followers"
                                titleClassName="text-xl"
                            />
                          </View>
                            <CustomButton
                                isLoading={isLoadingUnfollowing || isLoadingFollowing}
                                className="mt-6 min-h-12 px-12"
                                onPress={onFollow}
                            >
                              {isFollowed ? "Unfollow" : "Follow"}
                            </CustomButton>
                        </>
                      )}

                </View>
            )}
            ListEmptyComponent={() => (
                isLoadingPosts
                    ? <ActivityIndicator className="text-secondary"/>
                    : "No user found"
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/> }
        />
      </SafeAreaView>
  )
}

export default Profile;