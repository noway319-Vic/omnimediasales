import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, WorkRequest, UserRole, RequestType, RequestStatus, Notification } from '../types.ts';

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
  submitRequest: (req: Omit<WorkRequest, 'id' | 'status' | 'calculatedHours' | 'createdAt' | 'username' | 'userId'>) => void;
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

const safeJsonParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed || fallback;
  } catch (e) {
    console.error(`Error parsing ${key} from localStorage`, e);
    return fallback;
  }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const loaded = safeJsonParse('app_users', []);
    let list = Array.isArray(loaded) && loaded.length > 0 ? loaded : [SEED_ADMIN];
    if (!list.some(u => u.username === 'admin')) {
      list = [SEED_ADMIN, ...list];
    }
    return list;
  });

  const [requests, setRequests] = useState<WorkRequest[]>(() => {
    const loaded = safeJsonParse('app_requests', []);
    return Array.isArray(loaded) ? loaded : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return safeJsonParse('app_session', null);
  });

  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('app_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('app_session', JSON.stringify(currentUser));
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(freshUser);
      }
    } else {
      localStorage.removeItem('app_session');
    }
  }, [users, currentUser]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const login = (username: string, pass: string) => {
    const user = users.find(u => u.username === username.trim() && u.password === pass.trim());
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
    setUsers(prev => [...prev, newUser]);
    showNotification('成功建立使用者', 'success');
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) logout();
    showNotification('使用者已刪除', 'success');
  };

  const updatePassword = (id: string, newPass: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPass.trim() } : u));
    showNotification('密碼更新成功', 'success');
  };

  const submitRequest = (reqData: Omit<WorkRequest, 'id' | 'status' | 'calculatedHours' | 'createdAt' | 'username' | 'userId'>) => {
    if (!currentUser) return;

    let calculated = reqData.hours;
    if (reqData.type === RequestType.OVERTIME) {
      const day = new Date(reqData.date).getDay();
      if (day === 0 || day === 6) {
        calculated = 8; 
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

    setRequests(prev => [newReq, ...prev]);
    showNotification('申請單已送出', 'success');
  };

  const processRequest = (requestId: string, status: RequestStatus.APPROVED | RequestStatus.REJECTED) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    if (status === RequestStatus.APPROVED) {
      const targetUser = users.find(u => u.id === req.userId);
      if (targetUser) {
        let newBalance = targetUser.compTimeBalance;
        if (req.type === RequestType.OVERTIME) {
          newBalance += req.calculatedHours;
        } else {
          if (newBalance < req.hours) {
            showNotification('用戶餘額不足，無法核准', 'error');
            return;
          }
          newBalance -= req.hours;
        }
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, compTimeBalance: newBalance } : u));
      }
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status } : r));
    showNotification(`已${status === RequestStatus.APPROVED ? '核准' : '拒絕'}該申請`, 'success');
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