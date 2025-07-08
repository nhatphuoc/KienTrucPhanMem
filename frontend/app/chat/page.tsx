// frontend/app/chat/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import ChatComponent from '@/components/ChatComponents';
import { fetchFriends } from '@/lib/api';

interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  timestamp: string;
  mediaUrl?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const socketRef = useRef<W3CWebSocket | null>(null);
  const router = useRouter();
  const isMounted = useRef(false); // Theo dõi xem component đã mount chưa

  // Chỉ lấy email và token khi chạy trên trình duyệt
  const email = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    // Chỉ chạy logic khi component đã mount trên client
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!email || !token) {
      router.push('/login');
      return;
    }

    console.log('Component mounted, fetching friends with token:', token);
    fetchFriends(token)
      .then((data) => {
        console.log('Fetched users data:', data);
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Dữ liệu trả về không phải mảng:', data);
          toast.error('Dữ liệu người dùng không hợp lệ');
        }
      })
      .catch((error) => {
        console.error('Lỗi khi fetch friends:', error);
        toast.error('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối hoặc server.');
      });

    // Logic WebSocket chỉ chạy khi có selectedUserEmail
    if (!selectedUserEmail) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL!.replace('http', 'ws')}/ws/${selectedUserEmail}?token=${encodeURIComponent(token)}`;
    socketRef.current = new W3CWebSocket(wsUrl);

    socketRef.current.onopen = () => {
      console.log('WebSocket Connected');
      toast.success('Đã kết nối WebSocket');
    };

    socketRef.current.onmessage = (message) => {
      const envelope = JSON.parse(message.data as string);
      if (envelope.type === 'message') {
        setMessages((prev) => [...prev, envelope.data]);
      } else if (envelope.type === 'messages') {
        setMessages(envelope.data);
      } else if (envelope.type === 'error') {
        toast.error('Lỗi WebSocket: ' + envelope.data.error);
      }
    };

    socketRef.current.onerror = () => {
      toast.error('Lỗi kết nối WebSocket, đang thử lại...');
    };

    socketRef.current.onclose = () => {
      console.log('WebSocket Disconnected, reconnecting...');
      setTimeout(() => {
        if (selectedUserEmail && token) {
          socketRef.current = new W3CWebSocket(wsUrl);
          socketRef.current.onopen = () => toast.success('Đã kết nối lại WebSocket');
          socketRef.current.onmessage = socketRef.current.onmessage;
          socketRef.current.onerror = socketRef.current.onerror;
          socketRef.current.onclose = socketRef.current.onclose;
        }
      }, 1000);
    };

    // Lấy tin nhắn cũ
    fetch(`${process.env.NEXT_PUBLIC_MESSENGER_SERVER_URL}/messages?senderEmail=${email}&receiverEmail=${selectedUserEmail}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/login');
            toast.error('Phiên hết hạn, vui lòng đăng nhập lại');
          } else {
            toast.error('Lỗi lấy tin nhắn: ' + res.statusText);
          }
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setMessages(data);
      })
      .catch((error) => {
        console.error('Lỗi mạng:', error);
        toast.error('Lỗi mạng, vui lòng thử lại');
      });

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [email, token, selectedUserEmail, router]);

  const sendMessage = (content: string) => {
    if (content.trim() && socketRef.current && email && token && selectedUserEmail) {
      const message: Message = {
        id: '',
        senderEmail: email,
        receiverEmail: selectedUserEmail,
        content,
        timestamp: new Date().toISOString(),
        mediaUrl: '',
      };
      socketRef.current.send(JSON.stringify(message));
    }
  };

  if (!email || !token) return <div>Loading...</div>;

  return (
    <div className="container-fluid">
      <ToastContainer />
      <div className="row">
        <div className="col-3">
          <h3>Danh sách người dùng</h3>
          <ul className="list-group">
            {users.length === 0 && <li className="list-group-item">Không có người dùng hoặc tải thất bại</li>}
            {users.map((user) => (
              <li
                key={user.email}
                className={`list-group-item ${selectedUserEmail === user.email ? 'active' : ''}`}
                onClick={() => setSelectedUserEmail(user.email)}
                style={{ cursor: 'pointer' }}
              >
                {user.username || user.email}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-9">
          <h1 className="text-center my-4">Chat với {selectedUserEmail || 'Chọn người dùng'}</h1>
          {selectedUserEmail ? (
            <ChatComponent messages={messages} onSend={sendMessage} />
          ) : (
            <p>Vui lòng chọn một người dùng để trò chuyện</p>
          )}
        </div>
      </div>
    </div>
  );
}