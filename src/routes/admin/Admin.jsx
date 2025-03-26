import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./pages/Dashboard";
import BookingStatusTabs from "./Components/BookingStatusTabs";
import RoomManagement from "./pages/RoomManagement";

const { Content } = Layout;

function Admin() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("Admin component mounted");
    console.log("Current path:", location.pathname);
  }, [location]);

  const handleCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar onCollapse={handleCollapse} />
      <Layout
        className="transition-all duration-300"
        style={{ minWidth: '1024px' }}
      >
        <Content 
          style={{ 
            padding: 24, 
            background: '#fff',
            borderRadius: '4px',
            minHeight: 'calc(100vh - 48px)',
            overflow: 'auto'
          }}
        >
          <Routes>
            {/* Route mặc định khi vào /admin */}
            <Route index element={<Dashboard />} />
            
            {/* Các routes con */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<BookingStatusTabs />} />
            <Route path="room-management" element={<RoomManagement />} />            
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Admin;
