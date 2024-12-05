import {Text, TextInput, TextInputProps, TouchableOpacity, View, Image, Alert} from 'react-native';
import React, {useState} from 'react';
import icons from "@/constants/icons";
import {router, usePathname} from "expo-router";

interface Props extends TextInputProps {
  label?: string,
}

const SearchInput = ({label, className, secureTextEntry, ...props}: Props) => {
  const pathName = usePathname();
  const [query, setQuery] = useState('');

  return (
      <View className={`${className} focus:border-secondary`}>
        {label && <Text className="text-base text-gray-100 font-pmedium">
          {label}
        </Text>}
        <View className="border-2 border-black-200 w-full h-16 px-4 bg-black-100 rounded-2xl focus:border-secondary items-center mt-2 flex-row space-x-4">
          <TextInput
              className="text-base mt-0.5 text-white flex-1 font-pregular"
              placeholderTextColor="#CDCDE0"
              value={query}
              onChangeText={e => setQuery(e)}
              {...props}
          />
          <TouchableOpacity
            onPress={() => {
              if (!query) {
                return Alert.alert("Missing query", "Please input something to search results across database");
              }

              if (pathName.startsWith('/search'))
                router.setParams({query})
              else
                router.push(`/search/${query}`);
            }}
          >
            <Image
              source={icons.search}
              className="w-5 h-5"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
  )
}

export default SearchInput;