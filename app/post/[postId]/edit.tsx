import {ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import {useVideoPlayer, VideoView} from "expo-video";
import icons from "@/constants/icons";
import CustomButton from "@/components/CustomButton";
import {useLocalSearchParams} from "expo-router";
import {editPost, getFilePreview, getPost} from "@/lib/appwrite";
import {ImagePickerAsset, launchImageLibraryAsync} from "expo-image-picker";
import useAppwriteMutation from "@/hooks/useAppwriteMutation";
import useAppwriteQuery from "@/hooks/useAppwriteQuery";

export type EditPostFormType = {
  title: string,
  video: ImagePickerAsset | string | null,
  thumbnail: ImagePickerAsset | string | null,
  prompt: string
}

const EditPost = () => {
  const {postId} = useLocalSearchParams();
  const {data: post, isLoading} = useAppwriteQuery(() => getPost(postId.toString()), null);
  const initialFormState: EditPostFormType | null = post && {
    title: post.title,
    video: getFilePreview(post.video, 'video'),
    thumbnail: getFilePreview(post.thumbnail, 'image'),
    prompt: post.prompt
  }
  const [editPostTrigger, {isLoading: isUploading}] = useAppwriteMutation(() => editPost(postId.toString(), form));
  const [form, setForm] = useState<EditPostFormType | null>(null);
  const player = useVideoPlayer(form?.video ? typeof form?.video !== 'string' ? form?.video.uri : form.video : "");

  useEffect(() => {
    setForm(initialFormState);
  }, [post]);

  const onChangeText = (name: keyof EditPostFormType) => (text: string) => {
    if (!form) return;

    setForm({...form, [name]: text});
  }

  const onRefresh = () => {
    setForm(initialFormState);
  }

  const submit = async () => {
    if (!form) return;

    // If some of the form's field is empty
    if (Object.keys(form).some(key => !form[key as keyof EditPostFormType])) {
      return Alert.alert('Please fill in all the fields');
    }

    await editPostTrigger();

    Alert.alert("Post edited successfully");
  }

  const openPicker = (selectType: 'video' | 'image') => async () => {
    if (!form) return;

    const result = await launchImageLibraryAsync({
      mediaTypes: selectType === 'image' ? 'images' : 'videos'
    })

    if (!result.canceled) {
      if (selectType === 'image') {
        setForm({...form, thumbnail: result.assets[0]})
      } else if (selectType === 'video') {
        setForm({...form, video: result.assets[0]})
      }
    }
  }

  return (
      <SafeAreaView className="bg-primary h-full">
        <ScrollView
            className="px-4 my-6"
            refreshControl={
              <RefreshControl refreshing={false} onRefresh={onRefresh} />
            }
        >
          {isLoading
              ? (
                  <ActivityIndicator size="large" className="text-secondary"/>
              )
              : (
                  <>
                    {form &&
                      <>
                          <Text className="text-2xl text-white font-psemibold">
                              Edit Video
                          </Text>
                          <Text className="mt-2 text-lg text-gray-200">
                            {post?.$id}
                          </Text>
                          <FormField
                              label="Video Title"
                              value={form.title}
                              placeholder="Give your video a catch title..."
                              onChangeText={onChangeText('title')}
                              className="mt-10"
                          />
                          <View className="mt-7 gap-2">
                              <Text className="text-base text-gray-100 font-pmedium">
                                  Upload Video
                              </Text>
                              <TouchableOpacity
                                  className=""
                                  onPress={openPicker('video')}
                              >
                                {form.video ? (
                                    <>
                                      <VideoView
                                          player={player}
                                          style={{
                                            width: "100%",
                                            height: 256,
                                            borderRadius: 16
                                          }}
                                      />
                                      <CustomButton
                                          className="self-center mt-4 min-h-14"
                                          onPress={() => setForm(form => form && ({...form, video: null}))}
                                      >
                                        Delete Video
                                      </CustomButton>
                                    </>
                                ) : (
                                    <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center">
                                      <View className="w-14 h-14 border border-dashed border-secondary-100 justify-center items-center">
                                        <Image
                                            source={icons.upload}
                                            className="w-1/2 h-1/2"
                                            resizeMode="contain"
                                        />
                                      </View>
                                    </View>
                                )}
                              </TouchableOpacity>
                          </View>
                          <View className="mt-7 gap-2">
                              <Text className="text-base text-gray-100 font-pmedium">
                                  Thumbnail Image
                              </Text>
                              <TouchableOpacity
                                  className=""
                                  onPress={openPicker('image')}
                              >
                                {form.thumbnail ? (
                                    <>
                                      <Image
                                          source={{uri: typeof form.thumbnail === "string" ? form.thumbnail : form.thumbnail.uri}}
                                          resizeMode="cover"
                                          className="w-full h-64 rounded-2xl"
                                      />
                                      <CustomButton
                                          className="self-center mt-4 min-h-14"
                                          onPress={() => setForm(form => form && ({...form, thumbnail: null}))}
                                      >
                                        Delete Image
                                      </CustomButton>
                                    </>
                                ) : (
                                    <View className="w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row gap-2">
                                      <Image
                                          source={icons.upload}
                                          className="w-5 h-5"
                                          resizeMode="contain"
                                      />
                                      <Text className="text-sm text-gray-100 font-pmedium">
                                        Choose a file
                                      </Text>
                                    </View>
                                )}
                              </TouchableOpacity>
                          </View>
                          <FormField
                              label="AI Prompt"
                              value={form.prompt}
                              placeholder="The prompt you used to create this video"
                              onChangeText={onChangeText('prompt')}
                              className="mt-7"
                          />
                          <CustomButton
                              onPress={submit}
                              className="mt-7"
                              isLoading={isUploading}
                          >
                              Submit & Edit
                          </CustomButton>
                      </>
                    }
                  </>
            )}
        </ScrollView>
      </SafeAreaView>
  )
}

export default EditPost;