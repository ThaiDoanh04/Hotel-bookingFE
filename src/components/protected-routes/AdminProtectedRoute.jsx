import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { message } from 'antd';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { userDetails, isAdmin } = useContext(AuthContext);
  
  // Debug để xem thông tin user từ localStorage 
  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log("AdminRoute - User data from localStorage:", userData);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("AdminRoute - Is admin?", parsedUser.role === 'ADMIN');
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Kiểm tra trực tiếp từ localStorage nếu userDetails không tồn tại
  if (!userDetails) {
    console.log("userDetails is null, checking localStorage directly");
    const userData = localStorage.getItem('user');
    if (!userData) {
      message.error('Vui lòng đăng nhập để truy cập!');
      return <Navigate to="/login" replace />;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'ADMIN') {
        message.error('Bạn không có quyền truy cập trang quản trị!');
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      message.error('Lỗi xác thực. Vui lòng đăng nhập lại!');
      return <Navigate to="/login" replace />;
    }
  } else {
    if (!isAdmin()) {
      message.error('Bạn không có quyền truy cập trang quản trị!');
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default AdminProtectedRoute; 