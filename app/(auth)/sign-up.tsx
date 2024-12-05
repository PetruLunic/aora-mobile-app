import {Text, SafeAreaView, ScrollView, View, Image, Alert} from 'react-native';
import React, {useState} from 'react';
import images from "@/constants/images";
import FormField from "@/components/FormField";
import CustomButton from "@/components/CustomButton";
import {Link, router} from "expo-router";
import {createUser} from "@/lib/appwrite";
import {useGlobalContext} from "@/context/GlobalProvider";
import {showErrorAlert} from "@/lib/alert";

type FormType = {
  username: string,
  email: string,
  password: string
}

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {setUser, setIsLoggedIn} = useGlobalContext();

  const handleChangeText = (name: keyof FormType) => (value: string) => {
    setForm({...form, [name]: value})
  }

  const submit = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all the fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await createUser(form.email, form.username, form.password);
      setUser(newUser);
      setIsLoggedIn(true);

      router.replace('/home');
    } catch (e) {
     showErrorAlert("Error", e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
      <SafeAreaView className="bg-primary h-full">
        <ScrollView>
          <View className="w-full justify-center min-h-[100vh] px-4 my-6">
            <Image
                source={images.logo}
                resizeMode="contain"
                className="w-[115px] h-[35px]"
            />
            <Text className="text-2xl text-white text-semibold mt-10 text-psemibold">
              Sign up to Aora
            </Text>
            <FormField
                label="Username"
                className="mt-7"
                onChangeText={handleChangeText("username")}
            />
            <FormField
                label="Email"
                className="mt-7"
                value={form.email}
                onChangeText={handleChangeText("email")}
                keyboardType="email-address"
            />
            <FormField
                label="Password"
                secureTextEntry
                className="mt-7"
                onChangeText={handleChangeText("password")}
            />
            <CustomButton
                className="mt-7"
                onPress={submit}
                isLoading={isSubmitting}
            >
              Sign In
            </CustomButton>
            <View className="justify-center mt-7 flex-row gap-2">
              <Text className="text-lg text-gray-100 font-pregular">
                Have an account already?
              </Text>
              <Link
                  href="/sign-in"
                  className="text-lg font-psemibold text-secondary"
              >
                Sign In
              </Link>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  )
}

export default SignUp;