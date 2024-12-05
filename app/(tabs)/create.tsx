import {Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from "react-native-safe-area-context";
import FormField from "@/components/FormField";
import {useVideoPlayer, VideoView} from "expo-video";
import icons from "@/constants/icons";
import CustomButton from "@/components/CustomButton";
import {showErrorAlert} from "@/lib/alert";
import {router} from "expo-router";
import {useGlobalContext} from "@/context/GlobalProvider";
import {createVideo} from "@/lib/appwrite";
import {ImagePickerAsset, launchImageLibraryAsync} from "expo-image-picker";

export type CreateVideoFormType = {
  title: string,
  video: ImagePickerAsset | null,
  thumbnail: ImagePickerAsset | null,
  prompt: string
}

const Create = () => {
  const {user} = useGlobalContext();
  const initialFormState = {
    title: '',
    video: null,
    thumbnail: null,
    prompt: ''
  };
  const [form, setForm] = useState<CreateVideoFormType>(initialFormState);
  const player = useVideoPlayer(form.video?.uri || "");
  const [isUploading, setIsUploading] = useState(false);

  const onChangeText = (name: keyof CreateVideoFormType) => (text: string) => {
    setForm({...form, [name]: text});
  }

  const onRefresh = () => {
    setForm(initialFormState);
  }

  const submit = async () => {
    // If some of the form's field is empty
    if (Object.keys(form).some(key => !form[key as keyof CreateVideoFormType])) {
      return Alert.alert('Please fill in all the fields');
    }

    setIsUploading(true);

    try {
      await createVideo(form);

      Alert.alert('Success', 'Post uploaded successfully');
      router.push('/home');
    } catch (e) {
      showErrorAlert('Error', e);
    } finally {
      setForm(initialFormState);
      setIsUploading(false);
    }
  }

  const openPicker = (selectType: 'video' | 'image') => async () => {
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
        <Text className="text-2xl text-white font-psemibold">
          Upload Video
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
                <VideoView
                    player={player}
                    style={{
                      width: "100%",
                      height: 256,
                      borderRadius: 16
                    }}
                />
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
               <Image
                 source={{uri: form.thumbnail.uri}}
                 resizeMode="cover"
                 className="w-full h-64 rounded-2xl"
                 />
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
          Submit & Publish
        </CustomButton>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Create;