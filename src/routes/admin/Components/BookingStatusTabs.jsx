import React, { useState } from "react";
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
} from "antd";
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

// Sample booking data (replace with your actual data)
const initialBookings = {
  "Chờ xác nhận": [],
  "Đã xác nhận": [],
  "Chờ thanh toán": [],
  "Đã thanh toán": [],
  "Đã Hủy": [],
};

const BookingStatusTabs = () => {
  const [bookings, setBookings] = useState(initialBookings);
  const [currentPage, setCurrentPage] = useState({
    "Chờ xác nhận": 1,
    "Đã xác nhận": 1,
    "Chờ thanh toán": 1,
    "Đã thanh toán": 1,
    "Đã Hủy": 1,
  });
  const [sortOption, setSortOption] = useState({
    "Chờ xác nhận": "default",
    "Đã xác nhận": "default",
    "Chờ thanh toán": "default",
    "Đã thanh toán": "default",
    "Đã Hủy": "default",
  });
  const [filterOptions, setFilterOptions] = useState({
    "Chờ xác nhận": { dateRange: null, customer: "", price: "" },
    "Đã xác nhận": { dateRange: null, customer: "", price: "" },
    "Chờ thanh toán": { dateRange: null, customer: "", price: "" },
    "Đã thanh toán": { dateRange: null, customer: "", price: "" },
    "Đã Hủy": { dateRange: null, customer: "", price: "" },
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [currentTab, setCurrentTab] = useState(null);
  const pageSize = 5; // 5 bookings per page to match the image

  // Show confirmation modal before canceling
  const showCancelConfirm = (key, tab) => {
    setBookingToCancel(key);
    setCurrentTab(tab);
    setIsModalVisible(true);
  };

  // Handle booking cancellation after confirmation
  const handleConfirmCancel = () => {
    if (currentTab !== "Đã Hủy") {
      const updatedBookings = { ...bookings };
      const bookingToCancelData = updatedBookings[currentTab].find(
        (booking) => booking.key === bookingToCancel
      );
      updatedBookings[currentTab] = updatedBookings[currentTab].filter(
        (booking) => booking.key !== bookingToCancel
      );
      updatedBookings["Đã Hủy"].push({ ...bookingToCancelData });
      setBookings(updatedBookings);
      message.success(`Đã hủy đặt phòng với ID: ${bookingToCancel}`);
    } else {
      message.info("Đặt phòng này đã bị hủy!");
    }
    setIsModalVisible(false);
    setBookingToCancel(null);
    setCurrentTab(null);
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

  // Sort data based on the selected option
  const sortData = (data, sortOption) => {
    const sortedData = [...data];
    if (sortOption === "price-asc") {
      return sortedData.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\./g, "")) || 0;
        const priceB = parseInt(b.price.replace(/\./g, "")) || 0;
        return priceA - priceB;
      });
    } else if (sortOption === "price-desc") {
      return sortedData.sort((a, b) => {
        const priceA = parseInt(a.price.replace(/\./g, "")) || 0;
        const priceB = parseInt(b.price.replace(/\./g, "")) || 0;
        return priceB - priceA;
      });
    } else if (sortOption === "date-asc") {
      return sortedData.sort((a, b) => {
        const dateA = dayjs(a.checkIn, "YYYY-MM-DD").isValid()
          ? dayjs(a.checkIn, "YYYY-MM-DD")
          : dayjs(0);
        const dateB = dayjs(b.checkIn, "YYYY-MM-DD").isValid()
          ? dayjs(b.checkIn, "YYYY-MM-DD")
          : dayjs(0);
        return dateA - dateB;
      });
    } else if (sortOption === "date-desc") {
      return sortedData.sort((a, b) => {
        const dateA = dayjs(a.checkIn, "YYYY-MM-DD").isValid()
          ? dayjs(a.checkIn, "YYYY-MM-DD")
          : dayjs(0);
        const dateB = dayjs(b.checkIn, "YYYY-MM-DD").isValid()
          ? dayjs(b.checkIn, "YYYY-MM-DD")
          : dayjs(0);
        return dateB - dateA;
      });
    }
    return sortedData; // Default: no sorting
  };

  // Filter data based on the selected filters
  const filterData = (data, filters) => {
    let filteredData = [...data];

    // Filter by date range
    if (
      filters.dateRange &&
      Array.isArray(filters.dateRange) &&
      filters.dateRange.length === 2
    ) {
      const [startDate, endDate] = filters.dateRange;
      if (startDate && endDate) {
        filteredData = filteredData.filter((booking) => {
          const checkInDate = dayjs(booking.checkIn, "YYYY-MM-DD");
          return (
            checkInDate.isValid() &&
            checkInDate.isBetween(startDate, endDate, null, "[]")
          ); // Inclusive range
        });
      }
    }

    // Filter by customer name
    if (filters.customer) {
      filteredData = filteredData.filter(
        (booking) =>
          booking.customer &&
          booking.customer
            .toLowerCase()
            .includes(filters.customer.toLowerCase())
      );
    }

    // Filter by price
    if (filters.price) {
      filteredData = filteredData.filter((booking) => {
        const price = parseInt(booking.price.replace(/\./g, "")) || 0;
        if (filters.price === "less-5000000") {
          return price < 5000000;
        } else if (filters.price === "equal-5000000") {
          return price === 5000000;
        } else if (filters.price === "greater-5000000") {
          return price > 5000000;
        }
        return true; // Default case (shouldn't reach here)
      });
    }

    return filteredData;
  };

  // Table columns
  const columns = (tab) => [
    {
      title: "Số điện thoại",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Người đặt",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Ngày nhận phòng",
      dataIndex: "checkIn",
      key: "checkIn",
    },
    {
      title: "Ngày trả phòng",
      dataIndex: "checkOut",
      key: "checkOut",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => `${text} đ`,
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          danger
          onClick={() => showCancelConfirm(record.key, tab)}
          disabled={tab === "Đã Hủy"} // Disable button for "Đã Hủy" tab
        >
          Hủy đặt
        </Button>
      ),
    },
  ];

  // Tab items
  const tabItems = Object.keys(bookings).map((tab) => {
    const filteredData = filterData(bookings[tab], filterOptions[tab]);
    const sortedData = sortData(filteredData, sortOption[tab]);
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice(
      (currentPage[tab] - 1) * pageSize,
      currentPage[tab] * pageSize
    );

    return {
      label: tab,
      key: tab,
      children: (
        <div>
          {/* Filter Bar and Pagination */}
          <div className="flex justify-between items-center mb-4">
            {/* Filter Bar */}
            <Space>
              <Select
                value={sortOption[tab]}
                style={{ width: 150 }}
                onChange={(value) => handleSortChange(tab, value)}
              >
                <Option value="default">Sắp xếp theo</Option>
                <Option value="price-asc">Giá: Thấp đến cao</Option>
                <Option value="price-desc">Giá: Cao đến thấp</Option>
                <Option value="date-asc">Ngày: Cũ đến mới</Option>
                <Option value="date-desc">Ngày: Mới đến cũ</Option>
              </Select>
              <RangePicker
                style={{ width: 240 }}
                format="YYYY-MM-DD"
                onChange={(dates) =>
                  handleFilterChange(tab, "dateRange", dates)
                }
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                value={filterOptions[tab].dateRange}
              />
              <Input
                style={{ width: 120 }}
                placeholder="Tên"
                onChange={(e) =>
                  handleFilterChange(tab, "customer", e.target.value)
                }
                value={filterOptions[tab].customer}
                allowClear
              />
              <Select
                value={filterOptions[tab].price || "default"}
                style={{ width: 120 }}
                onChange={(value) =>
                  handleFilterChange(
                    tab,
                    "price",
                    value === "default" ? "" : value
                  )
                }
              >
                <Option value="default">Giá</Option>
                <Option value="less-5000000">&lt; 5.000.000</Option>
                <Option value="equal-5000000">= 5.000.000</Option>
                <Option value="greater-5000000">&gt; 5.000.000</Option>
              </Select>
            </Space>

            {/* Pagination */}
            <Space>
              <Button
                onClick={() => handlePageChange(tab, currentPage[tab] - 1)}
                disabled={currentPage[tab] === 1}
                style={{ marginRight: "8px" }}
              >
                &lt;
              </Button>
              <span>{`${currentPage[tab]} / ${totalPages || 1}`}</span>
              <Button
                onClick={() => handlePageChange(tab, currentPage[tab] + 1)}
                disabled={currentPage[tab] === totalPages || totalPages === 0}
                style={{ marginLeft: "8px" }}
              >
                &gt;
              </Button>
            </Space>
          </div>

          {/* Table */}
          <Table
            columns={columns(tab)}
            dataSource={paginatedData}
            pagination={false}
            rowKey="key"
            locale={{ emptyText: "Không có dữ liệu" }}
          />
        </div>
      ),
    };
  });

  return (
    <div className="p-6 h-full flex flex-col w-full">
      <Tabs items={tabItems} />
      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận hủy đặt phòng"
        open={isModalVisible}
        onOk={handleConfirmCancel}
        onCancel={handleCancelModal}
        okText="Có"
        cancelText="Không"
      >
        <p>Bạn có muốn hủy phòng không?</p>
      </Modal>
    </div>
  );
};

export default BookingStatusTabs;
