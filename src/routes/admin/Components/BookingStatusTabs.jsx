import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  message,
  Select,
  Space,
  DatePicker,
  Input,
  Modal,
  Tag,
  Card,
  Typography,
  Divider
} from "antd";
import { LeftOutlined, RightOutlined, SearchOutlined, CalendarOutlined, SortAscendingOutlined, UserOutlined, MailOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { get, del } from "../../../utils/request";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// Map booking status to tab names và màu sắc - Sửa lại chỉ còn 3 trạng thái
const statusMapping = {
  "PENDING": "Chờ thanh toán",
  "PAID": "Đã thanh toán",
  "CANCELED": "Đã Hủy"
};

const statusColors = {
  "Chờ thanh toán": "purple",
  "Đã thanh toán": "green",
  "Đã Hủy": "red"
};

const BookingStatusTabs = () => {
  // Sửa lại state để chỉ còn 3 tab
  const [bookings, setBookings] = useState({
    "Chờ thanh toán": [],
    "Đã thanh toán": [],
    "Đã Hủy": [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState({
    "Chờ thanh toán": 1,
    "Đã thanh toán": 1,
    "Đã Hủy": 1,
  });
  
  const [sortOption, setSortOption] = useState({
    "Chờ thanh toán": "default",
    "Đã thanh toán": "default",
    "Đã Hủy": "default",
  });
  
  const [filterOptions, setFilterOptions] = useState({
    "Chờ thanh toán": { dateRange: null, customer: "", price: "", email: "" },
    "Đã thanh toán": { dateRange: null, customer: "", price: "", email: "" },
    "Đã Hủy": { dateRange: null, customer: "", price: "", email: "" },
  });
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [currentTab, setCurrentTab] = useState(null);
  const pageSize = 5;
  const [bookingDetail, setBookingDetail] = useState(null);

  // Đưa hàm fetchAllBookings ra ngoài useEffect để có thể gọi lại khi cần
  const fetchAllBookings = async () => {
    try {
      setIsLoading(true);
      const response = await get('api/bookings');
      console.log("Fetched bookings:", response);
      
      // Organize bookings by status - sửa lại chỉ còn 3 loại
      const categorizedBookings = {
        "Chờ thanh toán": [],
        "Đã thanh toán": [],
        "Đã Hủy": [],
      };
      
      // Chuyển đổi trạng thái payment thành booking status
      const paymentToStatusMapping = {
        "PENDING": "PENDING",
        "WAITING_PAYMENT": "PENDING", // Mapping cả WAITING_PAYMENT sang PENDING
        "CONFIRMED": "PENDING", // Mapping CONFIRMED sang PENDING
        "PAID": "PAID",
        "CANCELED": "CANCELED"
      };
      
      // Process the API response data
      if (Array.isArray(response)) {
        response.forEach(booking => {
          // Lấy trạng thái từ paymentStatus hoặc dùng PENDING làm mặc định
          const bookingStatus = paymentToStatusMapping[booking.paymentStatus] || "PENDING";
          const tabName = statusMapping[bookingStatus] || "Chờ thanh toán";
          
          // Format the booking data for display with the correct field names
          const formattedBooking = {
            key: booking.bookingId.toString(),
            quantity: booking.guestPhoneNumber || 'N/A',
            customer: booking.guestFullName || 'Guest',
            checkIn: booking.checkInDate,
            checkOut: booking.checkOutDate,
            price: booking.totalAmount || booking.pricePerNight || 0,
            status: bookingStatus,
            hotelName: booking.hotelName || `Hotel ID: ${booking.hotelId}`,
            numberOfRooms: booking.numberOfRooms || 1,
            numberOfGuests: booking.numberOfGuests || 1,
            bookingDate: booking.bookingDate || new Date().toISOString(),
            roomType: booking.roomType || 'Standard',
            guestEmail: booking.guestEmail || 'N/A'
          };
          
          categorizedBookings[tabName].push(formattedBooking);
        });
      }
      
      setBookings(categorizedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải dữ liệu đặt phòng");
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi fetchAllBookings khi component mount
  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Show confirmation modal before canceling
  const showCancelConfirm = (key, tab) => {
    setBookingToCancel(key);
    setCurrentTab(tab);
    
    // Tìm booking đã chọn để hiển thị thông tin chi tiết
    const selectedBooking = bookings[tab].find(booking => booking.key === key);
    setBookingDetail(selectedBooking);
    
    setIsModalVisible(true);
  };

  // Handle booking cancellation after confirmation
  const handleConfirmCancel = async () => {
    try {
      if (currentTab !== "Đã Hủy") {
        // Thiết lập loading để tránh người dùng thao tác khi đang hủy
        setIsLoading(true);
        
        // Call API to cancel booking - đã cập nhật endpoint để khớp với API của bạn
        await del(`api/bookings/cancel/${bookingToCancel}`);
        
        // Tải lại dữ liệu sau khi hủy thành công
        await fetchAllBookings();
        
        message.success(`Đã hủy đặt phòng với ID: ${bookingToCancel}`);
      } else {
        message.info("Đặt phòng này đã bị hủy!");
      }
    } catch (error) {
      console.error("Error canceling booking:", error);
      message.error("Không thể hủy đặt phòng. Vui lòng thử lại.");
      setIsLoading(false); // Đảm bảo tắt loading nếu có lỗi
    } finally {
      setIsModalVisible(false);
      setBookingToCancel(null);
      setCurrentTab(null);
    }
  };

  // Handle modal cancel (click "Không")
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setBookingToCancel(null);
    setCurrentTab(null);
  };

  // Handle page change for each tab
  const handlePageChange = (tab, newPage) => {
    setCurrentPage((prev) => ({
      ...prev,
      [tab]: newPage,
    }));
  };

  // Handle sorting
  const handleSortChange = (tab, value) => {
    setSortOption((prev) => ({
      ...prev,
      [tab]: value,
    }));
  };

  // Handle filter changes
  const handleFilterChange = (tab, field, value) => {
    setFilterOptions((prev) => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
    setCurrentPage((prev) => ({
      ...prev,
      [tab]: 1, // Reset to first page when filters change
    }));
  };

  // Filter data based on selected filters
  const filterData = (data, filter) => {
    return data.filter((item) => {
      // Filter by customer name
      const customerMatch = filter.customer
        ? item.customer.toLowerCase().includes(filter.customer.toLowerCase())
        : true;

      // Filter by email
      const emailMatch = filter.email
        ? item.guestEmail.toLowerCase().includes(filter.email.toLowerCase())
        : true;

      // Filter by date range
      let dateMatch = true;
      if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
        const checkInDate = dayjs(item.checkIn);
        const startDate = dayjs(filter.dateRange[0]);
        const endDate = dayjs(filter.dateRange[1]);
        dateMatch = checkInDate.isAfter(startDate) && checkInDate.isBefore(endDate);
      }

      // Filter by price range
      let priceMatch = true;
      if (filter.price) {
        const price = parseFloat(item.price);
        const filterPrice = parseFloat(filter.price);
        priceMatch = !isNaN(price) && !isNaN(filterPrice) && price >= filterPrice;
      }

      return customerMatch && dateMatch && priceMatch && emailMatch;
    });
  };

  // Sort data based on the selected option
  const sortData = (data, sortOption) => {
    const sortedData = [...data];
    switch (sortOption) {
      case "price-asc":
        return sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case "price-desc":
        return sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case "date-asc":
        return sortedData.sort((a, b) => new Date(a.checkIn) - new Date(b.checkIn));
      case "date-desc":
        return sortedData.sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
      default:
        return sortedData;
    }
  };

  // Tạo cột cho table với kiểu dáng đẹp
  const columns = (tab) => [
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
      render: (text) => (
        <div className="flex items-center">
          <UserOutlined className="mr-2 text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "guestEmail",
      key: "guestEmail",
      render: (text) => (
        <div className="flex items-center">
          <MailOutlined className="mr-2 text-blue-500" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Ngày nhận phòng",
      dataIndex: "checkIn",
      key: "checkIn",
      render: (text) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-green-500" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Ngày trả phòng",
      dataIndex: "checkOut",
      key: "checkOut",
      render: (text) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-red-500" />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Số phòng",
      dataIndex: "numberOfRooms",
      key: "numberOfRooms",
      render: (text) => (
        <Tag color="blue" className="text-center font-medium px-3 py-1">
          {text}
        </Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "price",
      key: "price",
      render: (text) => (
        <div className="font-bold text-right text-indigo-600">
          {text.toLocaleString()} VND
        </div>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => showCancelConfirm(record.key, tab)}
          disabled={tab === "Đã Hủy"}
          className="rounded-full px-4"
        >
          Hủy đặt
        </Button>
      ),
    },
  ];

  // Tab items với UI cải tiến
  const tabItems = Object.keys(bookings).map((tab) => {
    const filteredData = filterData(bookings[tab], filterOptions[tab]);
    const sortedData = sortData(filteredData, sortOption[tab]);
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice(
      (currentPage[tab] - 1) * pageSize,
      currentPage[tab] * pageSize
    );

    return {
      label: (
        <span className="flex items-center">
          <Tag color={statusColors[tab]} className="mr-2">
            {bookings[tab].length}
          </Tag>
          {tab}
        </span>
      ),
      key: tab,
      children: (
        <Card className="shadow-sm">
          {/* Filter Bar and Pagination - Đã bỏ responsive */}
          <div className="flex justify-between items-center mb-6">
            {/* Filter Bar */}
            <div className="bg-gray-50 p-3 rounded-lg shadow-sm flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
              <Select
                value={sortOption[tab]}
                style={{ width: 170 }}
                onChange={(value) => handleSortChange(tab, value)}
                className="shadow-sm"
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="default">Sắp xếp theo</Option>
                <Option value="price-asc">Giá: Thấp đến cao</Option>
                <Option value="price-desc">Giá: Cao đến thấp</Option>
                <Option value="date-asc">Ngày: Cũ đến mới</Option>
                <Option value="date-desc">Ngày: Mới đến cũ</Option>
              </Select>
              <RangePicker
                style={{ width: 280 }}
                format="YYYY-MM-DD"
                onChange={(dates) =>
                  handleFilterChange(tab, "dateRange", dates)
                }
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                value={filterOptions[tab].dateRange}
                className="shadow-sm"
              />
              <Input
                style={{ width: 150 }}
                placeholder="Tên khách"
                onChange={(e) =>
                  handleFilterChange(tab, "customer", e.target.value)
                }
                value={filterOptions[tab].customer}
                allowClear
                prefix={<UserOutlined className="text-gray-400" />}
                className="shadow-sm"
              />
              <Input
                style={{ width: 180 }}
                placeholder="Email"
                onChange={(e) =>
                  handleFilterChange(tab, "email", e.target.value)
                }
                value={filterOptions[tab].email}
                allowClear
                prefix={<MailOutlined className="text-gray-400" />}
                className="shadow-sm"
              />
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border min-w-max">
                <Button
                  icon={<LeftOutlined />}
                  disabled={currentPage[tab] === 1}
                  onClick={() =>
                    handlePageChange(tab, currentPage[tab] - 1)
                  }
                  className="mr-2"
                />
                <span className="px-3 py-1 bg-blue-50 rounded-lg font-medium text-blue-600">
                  {currentPage[tab]} / {totalPages}
                </span>
                <Button
                  icon={<RightOutlined />}
                  disabled={currentPage[tab] === totalPages}
                  onClick={() =>
                    handlePageChange(tab, currentPage[tab] + 1)
                  }
                  className="ml-2"
                />
              </div>
            )}
          </div>

          {/* Table */}
          <Table
            columns={columns(tab)}
            dataSource={paginatedData}
            pagination={false}
            loading={isLoading}
            locale={{
              emptyText: "Không có dữ liệu đặt phòng",
            }}
            className="shadow-lg rounded-lg overflow-hidden"
            rowClassName="hover:bg-blue-50 transition-colors"
          />
        </Card>
      ),
    };
  });

  return (
    <div className="p-6 h-full flex flex-col w-full">
      <Title level={2} className="mb-6 text-indigo-700">
        <span className="border-b-2 border-indigo-500 pb-1">Quản lý đặt phòng</span>
      </Title>
      
      <div className="mb-4 flex justify-end">
        <Button 
          type="primary" 
          onClick={fetchAllBookings} 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Làm mới dữ liệu
        </Button>
      </div>
      
      <Tabs
        type="card"
        items={tabItems}
        className="custom-tabs"
        animated={true}
      />
      
      {/* Confirmation Modal */}
      <Modal
        title={
          <Title level={4} className="text-red-500 flex items-center">
            <span className="mr-2">⚠️</span>
            Xác nhận hủy đặt phòng
          </Title>
        }
        open={isModalVisible}
        onOk={handleConfirmCancel}
        onCancel={handleCancelModal}
        okText="Có, hủy đặt phòng"
        cancelText="Không, giữ nguyên"
        okButtonProps={{ 
          danger: true,
          className: "bg-red-500 hover:bg-red-600"
        }}
        width={500}
        centered
        confirmLoading={isLoading}
      >
        {bookingDetail && (
          <div>
            <p className="mb-4 text-gray-700">Bạn có chắc chắn muốn hủy đặt phòng có thông tin sau:</p>
            <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">ID Booking:</span>
                <span className="font-bold text-blue-600">{bookingDetail.key}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Khách hàng:</span>
                <span className="font-medium">{bookingDetail.customer}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Email:</span>
                <span>{bookingDetail.guestEmail}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Khách sạn:</span>
                <span>{bookingDetail.hotelName}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Ngày nhận phòng:</span>
                <span className="text-green-600">{bookingDetail.checkIn}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Ngày trả phòng:</span>
                <span className="text-red-600">{bookingDetail.checkOut}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Số phòng:</span>
                <span>{bookingDetail.numberOfRooms}</span>
              </div>
              <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Số khách:</span>
                <span>{bookingDetail.numberOfGuests}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Tổng tiền:</span>
                <span className="font-bold text-indigo-600">{bookingDetail.price.toLocaleString()} VND</span>
              </div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-red-600 font-medium flex items-center">
                <span className="mr-2">⚠️</span>
                Lưu ý: Hành động này không thể hoàn tác sau khi xác nhận!
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingStatusTabs;
