// 'use client';
// import { useState, useEffect } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import FriendList from '@/components/FriendList';

// interface Friend {
//   id: string;
//   username: string;
//   status: string;
// }

// export default function Friends() {
//   const [friends, setFriends] = useState<Friend[]>([]);
//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//   const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null; // dùng email thay userId

//   useEffect(() => {
//     if (!token || !email) {
//       window.location.href = '/login';
//       return;
//     }

//     fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends?email=${email}`, { // đổi thành email
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setFriends(data));
//   }, [token, email]);

//   const handleAddFriend = () => {
//     const friendEmail = prompt('Enter friend email to add:'); // đổi prompt hỏi email
//     if (friendEmail && token && email) {
//       fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ email, friendEmail }), // đổi thành email
//       })
//         .then((res) => res.json())
//         .then(() => {
//           fetch(`${process.env.NEXT_PUBLIC_FACEBOOK_SERVICE_URL}/friends?email=${email}`, { // refetch
//             headers: { Authorization: `Bearer ${token}` },
//           })
//             .then((res) => res.json())
//             .then((data) => setFriends(data));
//         });
//     }
//   };

//   if (!token || !email) return null;

//   return (
//     <div className="container-fluid">
//       <div className="row">
//         <div className="col-12">
//           <h1 className="text-center my-4">Friends</h1>
//           <FriendList friends={friends} onAddFriend={handleAddFriend} />
//         </div>
//       </div>
//     </div>
//   );
// }
// frontend/app/friends/page.tsx
'use client';
import { useState, useEffect } from 'react';
import FriendList from '@/components/FriendList';
import SearchBar from '@/components/SearchBar';
import { fetchFriends, searchUsers, sendFriendRequest } from '@/lib/api';

interface Friend {
  id: string;
  username: string;
  avatar: string;
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  useEffect(() => {
    if (!token || !email) {
      window.location.href = '/login';
      return;
    }

    const loadFriends = async () => {
      try {
        const data = await fetchFriends(token);
        setFriends(data);
      } catch (err) {
        setError('Failed to load friends');
      }
    };

    loadFriends();
  }, [token, email]);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      if (!token) {
        setError('Authentication token missing');
        return;
      }
      const results = await searchUsers(query, token);
      setSearchResults(results);
      setError(null);
    } catch (err) {
      setError('Failed to search users');
    }
  };

  const handleAddFriend = async (friendEmail: string) => {
    if (!token || !email) return;
    try {
      await sendFriendRequest(friendEmail, token);
      const updatedFriends = await fetchFriends(token);
      setFriends(updatedFriends);
      alert('Friend request sent!');
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  if (!token || !email) return null;

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Friends</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <SearchBar onSearch={handleSearch} />
      {searchResults.length > 0 && (
        <div className="my-4">
          <h3>Search Results</h3>
          <ul className="list-group">
            {searchResults.map((user) => (
              <li key={user.id} className="list-group-item">
                <a href={`/profile/${user.id}`} className="d-flex align-items-center">
                  <img src={user.avatar} alt={user.username} className="rounded-circle me-2" width="30" />
                  {user.username}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <FriendList friends={friends} onAddFriend={handleAddFriend} />
    </div>
  );
}