import {Text, View, ViewProps} from 'react-native';
import React from 'react';

interface Props extends ViewProps {
  title: string,
  subtitle?: string,
  titleClassName: string
}

const InfoBox = ({title, subtitle, titleClassName, ...props}: Props) => {
  return (
    <View {...props}>
      <Text className={`text-white text-center font-psemibold ${titleClassName}`}>
        {title}
      </Text>
      {subtitle && <Text className="text-sm text-gray-100 text-center font-pregular">
        {subtitle}
      </Text>}
    </View>
  )
}

export default InfoBox;