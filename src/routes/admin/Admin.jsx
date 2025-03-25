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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    console.log("Admin component mounted");
    console.log("Current path:", location.pathname);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCollapse = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar onCollapse={handleCollapse} />
      <Layout
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : isSidebarCollapsed ? "ml-[80px]" : "ml-[250px]"
        }`}
      >
        <Content 
          style={{ 
            margin: '24px 16px', 
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
