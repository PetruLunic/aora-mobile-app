import {Account, Avatars, Client, Databases, ID, ImageGravity, Query, Storage} from "react-native-appwrite";
import {Post, User, UserSession} from "@/types";
import {CreateVideoFormType} from "@/app/(tabs)/create";
import {ImagePickerAsset} from "expo-image-picker";
import {EditPostFormType} from "@/app/post/[postId]/edit";


// export const config = {
//   endpoint: 'https://cloud.appwrite.io/v1',
//   platform: 'com.petru.aora',
//   projectId: '67477ad1001ca259c7ec',
//   databaseId: '67477bd3002a6da7379c',
//   userCollectionId: '67477c000028e398390f',
//   videoCollectionId: '67477c2d001bcddd5316',
//   storageId: '674782b90029f3812e79'
// }

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.petru.aora',
  projectId: '674f1db90037c52c38f1',
  databaseId: '674f1de00003b0be463f',
  userCollectionId: '674f1de9001ba6639921',
  videoCollectionId: '674f1f1c0026e867dfe1',
  storageId: '674f1f30002036fe8eb9'
}

const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email: string, username: string, password: string): Promise<UserSession> => {
  try {
    const newAccount = await account.create(
        ID.unique(),
        email,
        password,
        username);

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    return await databases.createDocument(
        config.databaseId,
        config.userCollectionId,
        ID.unique(),
        {
          userId: newAccount.$id,
          email,
          username,
          avatar: avatarUrl
        }
    ) as UserSession;
  } catch (e) {
    console.error("Error at createUser: ", e);
    throw e;
  }
}

export async function signIn (email: string, password: string) {
  try {
    return account.createEmailPasswordSession(email, password);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getCurrentUser(): Promise<UserSession | undefined> {
  try {
    const currentAcc = await account.get();

    if (!currentAcc) throw Error;

    const users = await databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
        [Query.equal('userId', currentAcc.$id)]
    )

    // If no user was found
    if (users.total === 0) throw Error;

    return users.documents[0] as UserSession;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getUser(userId: string): Promise<User | undefined> {
  try {
    return await databases.getDocument(
        config.databaseId,
        config.userCollectionId,
        userId
    ) as User
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getAllPosts () {
  try {
    const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId,
        [Query.orderDesc('$createdAt')]
    )

    return posts.documents as Post[] || [];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getLatestPosts(limit?: number) {
  try {
    const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId,
        [Query.orderDesc('$createdAt'), Query.limit(limit || 7)]
    )

    return posts.documents as Post[] || [];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function searchPosts(query: string) {
  try {
    const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId,
        [Query.search('title', query)]
    )

    return posts.documents as Post[] || [];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getUserPosts(userId: string) {
  try {
    const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId,
        [Query.equal('creator', userId)]
    )

    return posts.documents as Post[] || [];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function signOut() {
  try {
    return await account.deleteSession('current');
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function getFilePreview(fileId: string, type: 'video' | 'image'): string {
  try {
    let fileUrl;

    if (type === 'video') {
      fileUrl = storage.getFileView(config.storageId, fileId);
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(config.storageId, fileId, 2000, 2000, ImageGravity.Top, 100);
    } else {
      throw new Error("Invalid file type");
    }

    if (!fileUrl) throw Error;

    return fileUrl.href;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function uploadFile(file: ImagePickerAsset): Promise<string> {
  if (!file || !file.mimeType || !file.fileName || !file.fileSize) throw new Error("Wrong file format provided");

  const {mimeType, fileName, fileSize, ...rest} = file;

  const asset = {
    name: fileName,
    size: fileSize,
    ...rest,
    type: mimeType,
  }

  try {
    const uploadedFile = await storage.createFile(
        config.storageId,
        ID.unique(),
        asset
    );

    return uploadedFile.$id;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(config.storageId, fileId);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function createVideo(form: CreateVideoFormType) {
  if (!form.thumbnail || !form.video) return;

  try {
    const user = await getCurrentUser();

    if (!user) throw Error("You are not signed in");

    const [thumbnailId, videoId] = await Promise.all([
        uploadFile(form.thumbnail),
        uploadFile(form.video),
    ])


    await databases.createDocument(
        config.databaseId, config.videoCollectionId, ID.unique(), {
          title: form.title,
          thumbnail: thumbnailId,
          video: videoId,
          prompt: form.prompt,
          creator: user.$id
        }
    )
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function likeVideo(userId: string, postId: string) {
  try {
    const [post, user] = await Promise.all([
      databases.getDocument(config.databaseId, config.videoCollectionId, postId),
      databases.getDocument(config.databaseId, config.userCollectionId, userId)
    ]) as [i1: Post, i2: User];

    if (!post) throw new Error(`Post not found with id ${postId}`);
    if (!user) throw new Error(`User not found with id ${userId}`);

    // If array is null
    if (!post.likedBy) post.likedBy = [];
    if (!user.likedPosts) user.likedPosts = [];

    // if user already liked this post
    if (user.likedPosts.map(post => post.$id).includes(postId)) throw new Error("Post already liked");

    // update User
    databases.updateDocument(
      config.databaseId, config.userCollectionId, userId, {
        likedPosts: user.likedPosts.map(post => post.$id).concat(postId)
      })

  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function unlikeVideo(userId: string, postId: string) {
  try {
    const user = await databases.getDocument(config.databaseId, config.userCollectionId, userId) as User;

    if (!user) throw new Error(`User not found with id ${userId}`);

    // If array is null
    if (!user.likedPosts) user.likedPosts = [];

    // update User
    databases.updateDocument(
        config.databaseId, config.userCollectionId, userId, {
          likedPosts: user.likedPosts.filter(post => post.$id !== postId)
        })

  } catch (e) {
    console.error(e);
    throw e;
  }
}


export async function getAllLikedPosts(userId: string) {
  try {
    if (!userId) throw new Error("No user id provided");

    const user = await databases.getDocument(
        config.databaseId,
        config.userCollectionId,
        userId
    ) as User;

    if (user.likedPosts.length === 0) return [];

    const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId,
        [Query.contains('$id', user.likedPosts.map(post => post.$id))]
    )

    return posts.documents as Post[];
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function followUser(userId: string) {
  try {
    if (!userId) throw new Error("No user id provided");

    const currentAcc = await account.get();

    const [currentUser, followedUser] = await Promise.all([
        databases.listDocuments(
        config.databaseId,
        config.userCollectionId,
            [Query.equal('userId', currentAcc.$id)]
    ).then(res => res.documents[0]),
      databases.getDocument(
          config.databaseId,
          config.userCollectionId,
          userId
      )
    ]) as User[];

    // If is already followed
    if (currentUser.follow.includes(userId) && followedUser.followers.includes(currentUser.$id))
      throw new Error("You are already followed to this user");

    // Pushing new ids in the arrays
    currentUser.follow.push(userId);
    followedUser.followers.push(currentUser.$id);

    await Promise.all([
      databases.updateDocument(
          config.databaseId,
          config.userCollectionId,
          currentUser.$id,
          {
            follow: currentUser.follow
          }
      ),
      databases.updateDocument(
          config.databaseId,
          config.userCollectionId,
          userId,
          {
            followers: followedUser.followers
          }
      )
    ])
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function unfollowUser(userId: string) {
  try {
    if (!userId) throw new Error("No user id provided");

    const currentAcc = await account.get();

    const [currentUser, followedUser] = await Promise.all([
      databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('userId', currentAcc.$id)]
      ).then(res => res.documents[0]),
      databases.getDocument(
          config.databaseId,
          config.userCollectionId,
          userId
      )
    ]) as User[];

    await Promise.all([
      databases.updateDocument(
          config.databaseId,
          config.userCollectionId,
          currentUser.$id,
          {
            follow: currentUser.follow.filter(id => id !== followedUser.$id)
          }
      ),
      databases.updateDocument(
          config.databaseId,
          config.userCollectionId,
          userId,
          {
            followers: followedUser.followers.filter(id => id !== currentUser.$id)
          }
      )
    ])
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getPost(postId: string) {
  try {
    return await databases.getDocument(
        config.databaseId, config.videoCollectionId, postId
    ) as Post;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function editPost(postId: string, newData: EditPostFormType | null) {
  try {
    if (!newData) throw new Error("No data provided for edit");

    const user = await getCurrentUser();

    if (!user) throw new Error("You are not signed up");

    const post = await databases.getDocument(
        config.databaseId, config.videoCollectionId, postId
    ) as Post;

    if (post.creator.$id !== user.$id) throw new Error("You can not edit this post");

    const editedPost = {
      ...newData,
      video: post.video,
      thumbnail: post.thumbnail
    }

    // If video was provided then replace it
    if (newData.video && typeof newData.video !== "string") {
      const videoId = await uploadFile(newData.video);
      await deleteFile(post.video);

      editedPost.video = videoId;
    }

    // If thumbnail was provided then replace it
    if (newData.thumbnail && typeof newData.thumbnail !== "string") {
      const thumbnailId = await uploadFile(newData.thumbnail);
      await deleteFile(post.thumbnail);

      editedPost.thumbnail = thumbnailId;
    }

    await databases.updateDocument(
        config.databaseId, config.videoCollectionId, postId, editedPost
    )
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function deletePost(postId: string) {
  try {
    const user = await getCurrentUser();

    if (!user) throw new Error("You are not signed up");

    const post = await databases.getDocument(
        config.databaseId, config.videoCollectionId, postId
    ) as Post;

    if (post.creator.$id !== user.$id) throw new Error("You can not delete this post");

    // Delete all files and the document
    await Promise.all([
      deleteFile(post.video),
      deleteFile(post.thumbnail),
      databases.deleteDocument(config.databaseId, config.videoCollectionId, postId)
    ])
  } catch (e) {
    console.error(e);
    throw e;
  }
}
