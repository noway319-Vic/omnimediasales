import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WorkRequest, UserRole, RequestType, RequestStatus, Notification } from '../types';

interface DataContextType {
  users: User[];
  currentUser: User | null;
  requests: WorkRequest[];
  notification: Notification | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'compTimeBalance'>) => void;
  deleteUser: (id: string) => void;
  updatePassword: (id: string, newPass: string) => void;
  submitRequest: (req: Omit<WorkRequest, 'id' | 'status' | 'calculatedHours' | 'createdAt' | 'username'>) => void;
  processRequest: (requestId: string, status: RequestStatus.APPROVED | RequestStatus.REJECTED) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SEED_ADMIN: User = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123',
  role: UserRole.ADMIN,
  compTimeBalance: 0,
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<WorkRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Load initial data
  useEffect(() => {
    const storedUsers = localStorage.getItem('app_users');
    const storedRequests = localStorage.getItem('app_requests');
    const storedSession = localStorage.getItem('app_session');

    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers([SEED_ADMIN]);
      localStorage.setItem('app_users', JSON.stringify([SEED_ADMIN]));
    }

    if (storedRequests) setRequests(JSON.parse(storedRequests));
    
    if (storedSession && storedUsers) {
        const sessionUser = JSON.parse(storedSession);
        const allUsers = storedUsers ? JSON.parse(storedUsers) : [SEED_ADMIN];
        const validUser = allUsers.find((u: User) => u.id === sessionUser.id);
        if (validUser) setCurrentUser(validUser);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('app_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (currentUser) {
        localStorage.setItem('app_session', JSON.stringify(currentUser));
        // Update current user ref from users array to keep balance in sync
        const freshUser = users.find(u => u.id === currentUser.id);
        if (freshUser && freshUser.compTimeBalance !== currentUser.compTimeBalance) {
            setCurrentUser(freshUser);
        }
    } else {
        localStorage.removeItem('app_session');
    }
  }, [currentUser, users]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const login = (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id' | 'compTimeBalance'>) => {
    if (users.some(u => u.username === userData.username)) {
      showNotification('帳號已存在', 'error');
      return;
    }
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      compTimeBalance: 0,
    };
    setUsers([...users, newUser]);
    showNotification('成功建立使用者', 'success');
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    showNotification('使用者已刪除', 'success');
  };

  const updatePassword = (id: string, newPass: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, password: newPass } : u));
    showNotification('密碼更新成功', 'success');
  };

  const submitRequest = (reqData: Omit<WorkRequest, 'id' | 'status' | 'calculatedHours' | 'createdAt' | 'username'>) => {
    if (!currentUser) return;

    // Business Logic: Weekend Rule
    let calculated = reqData.hours;
    if (reqData.type === RequestType.OVERTIME) {
      const day = new Date(reqData.date).getDay();
      // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) {
        calculated = 8; // Fixed 8 hours for weekends
      }
    }

    if (reqData.type === RequestType.LEAVE && currentUser.compTimeBalance < reqData.hours) {
        showNotification('您的補休餘額不足', 'error');
        return;
    }

    const newReq: WorkRequest = {
      ...reqData,
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      status: RequestStatus.PENDING,
      calculatedHours: calculated,
      createdAt: new Date().toISOString(),
    };

    setRequests([newReq, ...requests]);
    showNotification('申請單已送出', 'success');
  };

  const processRequest = (requestId: string, status: RequestStatus.APPROVED | RequestStatus.REJECTED) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    if (status === RequestStatus.APPROVED) {
      // Modify User Balance
      const targetUser = users.find(u => u.id === req.userId);
      if (targetUser) {
        let newBalance = targetUser.compTimeBalance;
        if (req.type === RequestType.OVERTIME) {
          newBalance += req.calculatedHours;
        } else {
          // Double check balance
          if (newBalance < req.hours) {
            showNotification('用戶餘額不足，無法核准', 'error');
            return;
          }
          newBalance -= req.hours;
        }

        setUsers(users.map(u => u.id === targetUser.id ? { ...u, compTimeBalance: newBalance } : u));
      }
    }

    setRequests(requests.map(r => r.id === requestId ? { ...r, status } : r));
    const statusText = status === RequestStatus.APPROVED ? '核准' : '拒絕';
    showNotification(`已${statusText}該申請`, 'success');
  };

  return (
    <DataContext.Provider value={{
      users,
      currentUser,
      requests,
      notification,
      login,
      logout,
      addUser,
      deleteUser,
      updatePassword,
      submitRequest,
      processRequest,
      showNotification
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within DataProvider");
  return context;
};