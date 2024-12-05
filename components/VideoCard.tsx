import {Image, Modal, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {Post} from "@/types";
import icons from "@/constants/icons";
import VideoScreen from "@/components/VideoScreen";
import CustomButton from "@/components/CustomButton";
import {deletePost, followUser, likeVideo, unfollowUser, unlikeVideo} from "@/lib/appwrite";
import useAppwriteMutation from "@/hooks/useAppwriteMutation";
import {useGlobalContext} from "@/context/GlobalProvider";
import {router} from "expo-router";
import DeletePostModal from "@/components/DeletePostModal";

interface Props {
  video: Post
}

const VideoCard = ({video: {title, thumbnail, video, $id, likedBy, creator: {username, avatar, $id: userId, followers}}}: Props) => {
  const {user} = useGlobalContext();
  const [isLikedByUser, setIsLikedByUser] = useState(likedBy.some(u => user?.$id === u.$id));
  const [isFollowed, setIsFollowed] = useState(followers.some(id => user?.$id === id));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [likeVideoTrigger, { isLoading: isLoadingLikeVideo}] = useAppwriteMutation(() => likeVideo(user?.$id, $id), null);
  const [unlikeVideoTrigger, { isLoading: isLoadingUnlikeVideo}] = useAppwriteMutation(() => unlikeVideo(user?.$id, $id), null);
  const [followTrigger, { isLoading: isLoadingFollowing}] = useAppwriteMutation(() => followUser(userId), null);
  const [unfollowTrigger, { isLoading: isLoadingUnfollowing}] = useAppwriteMutation(() => unfollowUser(userId), null);
  const [isDeletePostModalVisible, setIsDeletePostModalVisible] = useState(false);

  const onLike = async () => {
    if (isLikedByUser) {
      await unlikeVideoTrigger()
    } else {
      await likeVideoTrigger();
    }

    setIsLikedByUser(prev => !prev);
    setIsModalVisible(false);
  }

  const onFollow = async () => {
    if (isFollowed) {
      await unfollowTrigger();
    } else {
      await followTrigger();
    }

    setIsFollowed(prev => !prev);
    setIsModalVisible(false);
  }

  const onAvatarClick = () => {
    // If clicking on the logged-in user
    if (user?.$id === userId) {
      router.push('/profile')
    } else {
      // @ts-ignore
      router.push(`/profile/${userId}`)
    }
  }

  return (
      <>
        <View className="flex-col items-center px-4 mb-14">
          <View className="flex-row gap-3 items-start">
            <View className="justify-center items-center flex-row flex-1">
              <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                <TouchableOpacity
                    onPress={onAvatarClick}
                    className="bg-transparent w-full h-full"
                >
                  <Image
                      source={{uri: avatar}}
                      className="w-full h-full rounded-lg"
                      resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>

              <View className="justify-center flex-1 ml-3 gap-y-1">
                <Text
                    className="text-white font-psemibold text-sm"
                    numberOfLines={1}
                >
                  {title}
                </Text>
                <TouchableOpacity
                    onPress={onAvatarClick}
                >
                  <Text
                      className="text-xs text-gray-100 font-pregular"
                      numberOfLines={1}
                  >
                    {username}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="pt-2">
              <TouchableOpacity
                  className="rounded-full"
                  onPress={() => setIsModalVisible(true)}
              >
                <Image
                    source={icons.menu}
                    className="w-5 h-5"
                    resizeMode='contain'
                />
              </TouchableOpacity>
            </View>
          </View>

          <VideoScreen
              video={video}
              thumbnail={thumbnail}
              className="w-full h-60 rounded-xl my-5"
          />
        </View>
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
        >
          <View
              className="w-full h-full"
          >
            <TouchableOpacity
                className="flex-1"
                onPress={() => setIsModalVisible(false)}
                activeOpacity={1}
            >
            </TouchableOpacity>
            <View className="p-5 w-full bg-black-100 rounded-t-2xl gap-4">
              <CustomButton
                  onPress={onLike}
                  isLoading={isLoadingUnlikeVideo || isLoadingLikeVideo}
              >
                {isLikedByUser ? "Unlike" : "Like"}
              </CustomButton>
              {userId !== user?.$id && (
                  <CustomButton
                      onPress={onFollow}
                      isLoading={isLoadingFollowing || isLoadingUnfollowing}
                  >
                    {isFollowed ? "Unfollow" : "Follow"}
                  </CustomButton>
              )}
              {user?.$id === userId &&
                  <>
                      {/*Edit Button*/}
                      <CustomButton
                          onPress={() => {
                            // @ts-ignore
                            router.push(`/post/${$id}/edit`)
                            setIsModalVisible(false);
                          }}
                      >
                          Edit
                      </CustomButton>

                      {/*Delete Button*/}
                      <CustomButton
                          onPress={() => {
                            setIsDeletePostModalVisible(true);
                            setIsModalVisible(false);
                          }}
                      >
                          Delete
                      </CustomButton>
                  </>
              }
            </View>
          </View>
        </Modal>
        <DeletePostModal
            postId={$id}
            setIsVisible={setIsDeletePostModalVisible}
            visible={isDeletePostModalVisible}
        />
      </>
  )
}

export default VideoCard;