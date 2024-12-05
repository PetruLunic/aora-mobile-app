import {Models} from "react-native-appwrite";

export interface User extends Models.Document {
  avatar: string,
  userId: string,
  username: string,
  password: string,
  email: string,
  likedPosts: Post[],
  followers: string[],
  follow: string[]
}

export type UserSession = Omit<User, "password">;

export interface Post extends Models.Document {
  $id: string,
  title: string,
  thumbnail: string,
  prompt: string,
  video: string,
  creator: User,
  likedBy: User[],
}
