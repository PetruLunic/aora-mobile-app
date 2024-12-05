import {Text, TextInput, TextInputProps, TouchableOpacity, View, Image} from 'react-native';
import React, {useState} from 'react';
import icons from "@/constants/icons";

interface Props extends TextInputProps {
  label?: string,
}

const FormField = ({label, className, secureTextEntry, ...props}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View className={`${className}`}>
      {label && <Text className="text-base text-gray-100 font-pmedium">
        {label}
      </Text>}
      <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center mt-2 flex-row">
        <TextInput
            className="flex-1 text-white font-psemibold text-base"
            placeholderTextColor="#7B7B8B"
            secureTextEntry={secureTextEntry && !showPassword}
            {...props}
          />
        {secureTextEntry && (
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Image
                  source={showPassword ? icons.eye : icons.eyeHide}
                  className="w-8 h-8"
              />
            </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default FormField;