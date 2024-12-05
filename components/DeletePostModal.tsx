import {Alert, Modal, ModalProps, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import useAppwriteMutation from "@/hooks/useAppwriteMutation";
import {deletePost} from "@/lib/appwrite";
import CustomButton from "@/components/CustomButton";

interface Props extends ModalProps {
  postId: string,
  setIsVisible: (state: boolean) => void
}

const DeletePostModal = ({postId, setIsVisible, ...props}: Props) => {
  const [deletePostTrigger, { isLoading: isDeletingPost}] = useAppwriteMutation(() => deletePost(postId));

  const onDelete = async () => {
    await deletePostTrigger();
    setIsVisible(false);

    Alert.alert("Post deleted successfully");
  }

  return (
    <Modal
        animationType="slide"
        transparent
        {...props}
    >
      <View
          className="w-full h-full"
      >
        <TouchableOpacity
            className="flex-1"
            onPress={() => setIsVisible(false)}
            activeOpacity={1}
        >
        </TouchableOpacity>
        <View className="p-5 w-full bg-black-100 rounded-t-2xl gap-8">
          <Text className="text-white text-xl text-center">
            Are you sure?
          </Text>
          <View className="flex-row gap-3">
            <CustomButton
                onPress={() => setIsVisible(false)}
                className="flex-1"
            >
              Cancel
            </CustomButton>
            <CustomButton
                isLoading={isDeletingPost}
                onPress={onDelete}
                className="flex-1"
            >
              Delete
            </CustomButton>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default DeletePostModal;