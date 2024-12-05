import {ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps, View} from 'react-native';
import React from 'react';

interface Props extends TouchableOpacityProps {
  isLoading?: boolean
  textClassname?: string
}

const CustomButton = ({children, className, textClassname, isLoading, ...props}: Props) => {
  return (
    <TouchableOpacity
        className={`px-4 bg-secondary rounded-xl min-h-[62px] justify-center items-center ${className} ${isLoading ? "opacity-50" : ""}`}
        disabled={isLoading}
        {...props}
    >
      {isLoading
        ? (
            <ActivityIndicator size="large" className='text-primary' />
          )
        : (
            <Text className={`text-primary font-psemibold text-lg ${textClassname}`}>
              {children}
            </Text>
          )}

    </TouchableOpacity>
  )
}

export default CustomButton;