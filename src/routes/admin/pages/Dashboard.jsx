import React, { useState, useEffect } from "react";
import { Card, Col, Row, Typography, Select, Spin, Progress, Empty } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  AreaChart,
  Area
} from "recharts";
import { get } from "../../../utils/request";

const { Title } = Typography;
const { Option } = Select;

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("Tháng 1");
  const [chartData, setChartData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalHotels: 0,
    averageRating: 0,
    bookingSuccessRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Lấy dữ liệu booking và hotels
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Lấy dữ liệu đặt phòng
        const bookingsResponse = await get('api/bookings');
        // Lấy dữ liệu khách sạn
        const hotelsResponse = await get('api/hotels');
        
        // Log ra dữ liệu API để debug
        console.log("Bookings API Response:", bookingsResponse);
        console.log("Hotels API Response:", hotelsResponse);
        
        // Kiểm tra dữ liệu hợp lệ
        const validBookings = Array.isArray(bookingsResponse) ? bookingsResponse : [];
        const validHotels = Array.isArray(hotelsResponse) ? hotelsResponse : [];
        
        // Tính toán số liệu tổng hợp
        const totalBookings = validBookings.length;
        const totalRevenue = validBookings.reduce((sum, booking) => 
          sum + (parseFloat(booking.totalAmount) || 0), 0);
        const totalHotels = validHotels.length;
        
        // Tính xếp hạng trung bình của khách sạn
        const hotelsWithRatings = validHotels.filter(hotel => hotel.ratings !== undefined);
        const totalRatings = hotelsWithRatings.reduce((sum, hotel) => 
          sum + (parseFloat(hotel.ratings) || 0), 0);
        const averageRating = hotelsWithRatings.length > 0 
          ? (totalRatings / hotelsWithRatings.length).toFixed(1) 
          : 0;
        
        // Tính tỉ lệ đặt phòng thành công (PAID status)
        const successfulBookings = validBookings.filter(booking => 
          booking.paymentStatus === "PAID").length;
        const bookingSuccessRate = totalBookings > 0 
          ? Math.round((successfulBookings / totalBookings) * 100) 
          : 0;
        
        setSummaryData({
          totalBookings,
          totalRevenue,
          totalHotels,
          averageRating,
          bookingSuccessRate
        });
        
        // Phân tích dữ liệu theo tháng
        const processedData = processMonthlyData(validBookings, selectedMonth);
        console.log("Processed Chart Data:", processedData);
        setChartData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedMonth]);

  // Xử lý dữ liệu theo tháng đã chọn
  const processMonthlyData = (bookings, month) => {
    // Lấy số tháng từ tên tháng
    const monthNumber = parseInt(month.replace("Tháng ", ""));
    console.log("Processing data for month:", monthNumber);
    
    // Lọc các booking đã thanh toán thành công (PAID) và có ngày thanh toán
    const filteredBookings = bookings.filter(booking => {
      // Chỉ lấy các booking có status là PAID và có paymentDate
      if (booking.paymentStatus !== "PAID" || !booking.paymentDate) return false;
      
      try {
        const paymentDate = new Date(booking.paymentDate);
        const isInMonth = paymentDate.getMonth() + 1 === monthNumber;
        return isInMonth;
      } catch (error) {
        console.error("Error processing payment date:", error, booking);
        return false;
      }
    });
    
    console.log("Filtered PAID bookings for this month:", filteredBookings);
    
    // Tạo dữ liệu cho biểu đồ theo ngày trong tháng
    const daysInMonth = new Date(new Date().getFullYear(), monthNumber, 0).getDate();
    
    // Khởi tạo mảng dữ liệu với doanh thu mặc định là 0 cho mỗi ngày
    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      name: String(i + 1).padStart(2, "0"),
      revenue: 0
    }));
    
    // Cập nhật doanh thu cho mỗi ngày dựa trên dữ liệu booking
    filteredBookings.forEach(booking => {
      if (booking.paymentDate) {
        try {
          const paymentDate = new Date(booking.paymentDate);
          const day = paymentDate.getDate() - 1; // Chỉ số mảng bắt đầu từ 0
          
          console.log(`Booking ID: ${booking.bookingId || 'N/A'}, Payment Date: ${booking.paymentDate}, totalAmount:`, booking.totalAmount);
          
          if (day >= 0 && day < daysInMonth) {
            // Chuyển đổi totalAmount sang số
            const amount = parseFloat(booking.totalAmount) || 0;
            dailyData[day].revenue += amount;
            console.log(`Added ${amount} to day ${day + 1}, total now: ${dailyData[day].revenue}`);
          }
        } catch (error) {
          console.error("Error processing booking for chart:", error, booking);
        }
      }
    });
    
    return dailyData;
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  // Tùy chỉnh tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{`Ngày ${label}`}</p>
          <p className="text-blue-600">
            {`Doanh thu: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <Title level={2}>Tổng quan</Title>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-xl font-bold">{summaryData.totalBookings}</div>
                <div className="text-gray-500">Tổng số đặt phòng</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-xl font-bold">{formatCurrency(summaryData.totalRevenue)}</div>
                <div className="text-gray-500">Tổng doanh thu</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-xl font-bold">{summaryData.totalHotels}</div>
                <div className="text-gray-500">Tổng số khách sạn</div>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="dashboard-card border-l-4 border-l-yellow-500 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-xl font-bold">{summaryData.averageRating}</div>
                <div className="text-gray-500">Xếp hạng trung bình</div>
              </Card>
            </Col>
          </Row>

          {/* Thêm Card mới cho tỉ lệ đặt thành công */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24}>
              <Card className="dashboard-card shadow-md">
                <Title level={4}>Tỉ lệ đặt phòng thành công</Title>
                <Progress 
                  percent={summaryData.bookingSuccessRate} 
                  status="active" 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  strokeWidth={12}
                />
                <div className="mt-2 text-gray-600">
                  {summaryData.bookingSuccessRate}% đơn đặt phòng đã được thanh toán thành công
                </div>
              </Card>
            </Col>
          </Row>

          <Card
            title="Biểu đồ doanh thu"
            className="shadow-md"
            extra={
              <Select
                defaultValue={selectedMonth}
                style={{ width: 120 }}
                onChange={handleMonthChange}
                className="rounded-md"
              >
                <Option value="Tháng 1">Tháng 1</Option>
                <Option value="Tháng 2">Tháng 2</Option>
                <Option value="Tháng 3">Tháng 3</Option>
                <Option value="Tháng 4">Tháng 4</Option>
                <Option value="Tháng 5">Tháng 5</Option>
                <Option value="Tháng 6">Tháng 6</Option>
                <Option value="Tháng 7">Tháng 7</Option>
                <Option value="Tháng 8">Tháng 8</Option>
                <Option value="Tháng 9">Tháng 9</Option>
                <Option value="Tháng 10">Tháng 10</Option>
                <Option value="Tháng 11">Tháng 11</Option>
                <Option value="Tháng 12">Tháng 12</Option>
              </Select>
            }
          >
            <div style={{ width: "100%", height: 400 }}>
              {chartData.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 30,
                      bottom: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name">
                    </XAxis>
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('₫', '')}
                    >
                      <Label
                        value="Doanh thu (VND)"
                        angle={-90}
                        position="insideLeft"
                        style={{ textAnchor: "middle" }}
                      />
                    </YAxis>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu ngày"
                      stroke="#8884d8"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 8 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Empty 
                  description="Không có dữ liệu doanh thu cho tháng này" 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
