import {Image, Text, View, ViewProps} from 'react-native';
import React from 'react';
import images from "@/constants/images";
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";

interface Props extends ViewProps {
  title: string,
  subtitle: string
}

const EmptyState = ({title, subtitle, className, ...props}: Props) => {
  return (
    <View className="justify-center items-center px-4">
      <Image
        source={images.empty}
        className="w-[270px] h-[215px]"
        resizeMode="contain"
      />
      <Text className="text-xl text-center font-psemibold text-white">
        {title}
      </Text>
      <Text className="font-pmedium text-sm mt-2 text-gray-100">
        {subtitle}
      </Text>
      <CustomButton
        onPress={() => router.push('/create')}
        className="w-full my-5"
      >
        Create Video
      </CustomButton>
    </View>
  )
}

export default EmptyState;