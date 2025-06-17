'use client';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FriendList from '@/components/FriendList';

interface Friend {
  id: string;
  username: string;
  status: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null; // dùng email thay userId

  useEffect(() => {
    if (!token || !email) {
      window.location.href = '/login';
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends?email=${email}`, { // đổi thành email
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setFriends(data));
  }, [token, email]);

  const handleAddFriend = () => {
    const friendEmail = prompt('Enter friend email to add:'); // đổi prompt hỏi email
    if (friendEmail && token && email) {
      fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, friendEmail }), // đổi thành email
      })
        .then((res) => res.json())
        .then(() => {
          fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends?email=${email}`, { // refetch
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => setFriends(data));
        });
    }
  };

  if (!token || !email) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center my-4">Friends</h1>
          <FriendList friends={friends} onAddFriend={handleAddFriend} />
        </div>
      </div>
    </div>
  );
}
