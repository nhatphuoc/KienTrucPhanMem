// frontend/lib/api.ts
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
}

export async function fetchFriends(token: string): Promise<User[]> {
  console.log('Calling fetchFriends with URL:', `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/friends`, 'Method: GET');
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/friends`, {
    method: 'GET', // Chỉ định rõ phương thức GET
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Không thể lấy danh sách người dùng: ${res.status} - ${errorText}`);
  }
  return res.json();
}

// Giữ các hàm liên quan đến bài viết (có thể bỏ nếu không cần)
export async function fetchPosts(token: string): Promise<Post[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/posts/user/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể lấy bài viết: ' + res.statusText);
  return res.json();
}

export async function createPost(formData: FormData, token: string): Promise<Post> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Không thể tạo bài viết: ' + res.statusText);
  return res.json();
}

export async function updatePost(postId: string, formData: FormData, token: string): Promise<Post> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Không thể cập nhật bài viết: ' + res.statusText);
  return res.json();
}

export async function deletePost(postId: string, token: string): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Không thể xóa bài viết: ' + res.statusText);
}