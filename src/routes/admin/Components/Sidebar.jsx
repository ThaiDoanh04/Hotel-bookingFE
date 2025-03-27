import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Spin } from "antd";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  BookOutlined,
  HomeOutlined,
  EditOutlined,
  AppstoreOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

const Sidebar = ({ onCollapse }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    console.log("Sidebar rendered");
    console.log("Current path in sidebar:", location.pathname);
  }, [location]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        // QUAN TRỌNG: Sử dụng đường dẫn tuyệt đối bắt đầu bằng /admin/
        const data = [
          {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            path: "/admin/dashboard", // Đường dẫn tuyệt đối
          },
          {
            key: "2",
            icon: <BookOutlined />,
            label: "Quản lý đặt phòng",
            path: "/admin/bookings", // Đường dẫn tuyệt đối
          },
          {
            key: "3",
            icon: <HomeOutlined />,
            label: "Quản lý phòng",
            path: "/admin/room-management", // Đường dẫn tuyệt đối
          },
          {
            key: "4",
            icon: <HomeOutlined />,
            label: "Về trang chủ",
            path: "/", // Đường dẫn tới trang chủ
          }
        ];
        
        setMenuItems(data);
      } catch (error) {
        console.error("Error setting menu items:", error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    onCollapse(!collapsed);
    if (isMobile) {
      document.body.classList.toggle("sidebar-open");
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    console.log("Current path for selection:", path);
    
    // Tìm menu item phù hợp với path hiện tại
    const item = menuItems.find(item => path === item.path || 
                                       (path === '/admin' && item.path === '/admin/dashboard'));
    return item ? [item.key] : ["1"];
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      className={`h-screen fixed top-0 left-0 bg-gray-50 shadow-md z-50 transition-all duration-300 ${
        isMobile && collapsed ? "-translate-x-full" : "translate-x-0"
      }`}
      width={250}
      collapsedWidth={80}
    >
      <div className="flex items-center justify-center h-16 bg-gray-50 border-b border-gray-200">
        {collapsed ? (
          <div className="text-xl font-bold text-orange-500">HB</div>
        ) : (
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-2xl text-orange-500" />
            <div className="text-xl font-bold text-orange-500">
              Hotel Booking
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <Button
          type="primary"
          onClick={toggleCollapsed}
          className="w-full mb-4 bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={getSelectedKey()}
          className="h-full border-r-0"
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            // Sử dụng đường dẫn tuyệt đối thay vì tương đối
            label: <Link to={item.path}>{item.label}</Link>,
            className: "text-gray-700 hover:bg-gray-100 text-base py-3",
          }))}
        />
      )}
    </Sider>
  );
};

export default Sidebar;
