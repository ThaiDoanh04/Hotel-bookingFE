import React, { useState, useEffect } from "react";
import { Card, Col, Row, Typography, Select } from "antd";
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
} from "recharts";

const { Title } = Typography;
const { Option } = Select;

// Sample data for different months (replace with your actual data)
const getMonthData = (month) => {
  const baseData = Array.from({ length: 31 }, (_, i) => ({
    name: String(i + 1).padStart(2, "0"),
    revenue: 0, // Default to 0, replace with actual data
  }));

  // Simulate different revenue data for demonstration
  switch (month) {
    case "Tháng 1":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            50, 75, 60, 90, 80, 100, 85, 70, 65, 80, 95, 90, 75, 60, 85, 70, 90,
            100, 85, 75, 80, 95, 90, 70, 65, 80, 85, 90, 95, 100, 85,
          ][index] || 0,
      }));
    case "Tháng 2":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            40, 90, 70, 110, 95, 130, 100, 85, 80, 95, 120, 115, 90, 75, 100,
            85, 115, 130, 110, 90, 95, 120, 115, 85, 80, 95, 100, 115, 120, 130,
            110,
          ][index] || 0,
      }));
    case "Tháng 3":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            60, 120, 90, 150, 110, 180, 140, 115, 100, 130, 160, 155, 120, 95,
            140, 110, 160, 180, 150, 120, 130, 160, 155, 110, 100, 130, 140,
            160, 170, 180, 150,
          ][index] || 0,
      }));
    case "Tháng 4":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            45, 70, 60, 90, 80, 110, 95, 80, 70, 85, 100, 95, 80, 65, 90, 75,
            100, 110, 95, 80, 85, 100, 95, 75, 70, 85, 90, 100, 105, 110, 95,
          ][index] || 0,
      }));
    case "Tháng 5":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            55, 100, 85, 130, 110, 150, 125, 105, 90, 120, 140, 135, 110, 95,
            125, 100, 140, 150, 130, 110, 120, 140, 135, 100, 90, 120, 125, 140,
            145, 150, 130,
          ][index] || 0,
      }));
    case "Tháng 6":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            50, 80, 70, 100, 90, 120, 105, 90, 80, 95, 110, 105, 90, 75, 100,
            85, 110, 120, 105, 90, 95, 110, 105, 85, 80, 95, 100, 110, 115, 120,
            105,
          ][index] || 0,
      }));
    case "Tháng 7":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            60, 90, 80, 110, 100, 130, 115, 100, 90, 105, 120, 115, 100, 85,
            110, 95, 120, 130, 115, 100, 105, 120, 115, 95, 90, 105, 110, 120,
            125, 130, 115,
          ][index] || 0,
      }));
    case "Tháng 8":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            55, 85, 75, 105, 95, 125, 110, 95, 85, 100, 115, 110, 95, 80, 105,
            90, 115, 125, 110, 95, 100, 115, 110, 90, 85, 100, 105, 115, 120,
            125, 110,
          ][index] || 0,
      }));
    case "Tháng 9":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            65, 95, 85, 115, 105, 135, 120, 105, 95, 110, 125, 120, 105, 90,
            115, 100, 125, 135, 120, 105, 110, 125, 120, 100, 95, 110, 115, 125,
            130, 135, 120,
          ][index] || 0,
      }));
    case "Tháng 10":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            45, 70, 60, 90, 80, 100, 85, 70, 65, 80, 95, 90, 75, 60, 85, 70, 90,
            100, 85, 75, 80, 95, 90, 70, 65, 80, 85, 90, 95, 100, 85,
          ][index] || 0,
      }));
    case "Tháng 11":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            70, 110, 95, 140, 120, 160, 135, 115, 100, 130, 150, 145, 120, 105,
            135, 110, 150, 160, 140, 120, 130, 150, 145, 110, 100, 130, 135,
            150, 155, 160, 140,
          ][index] || 0,
      }));
    case "Tháng 12":
      return baseData.map((d, index) => ({
        ...d,
        revenue:
          [
            50, 80, 70, 100, 90, 120, 105, 90, 80, 95, 110, 105, 90, 75, 100,
            85, 110, 120, 105, 90, 95, 110, 105, 85, 80, 95, 100, 110, 115, 120,
            105,
          ][index] || 0,
      }));
    default:
      return baseData;
  }
};

const Dashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState("Tháng 1");
  const [chartData, setChartData] = useState(getMonthData("Tháng 1"));

  useEffect(() => {
    setChartData(getMonthData(selectedMonth));
  }, [selectedMonth]);

  return (
    <div className="p-6 h-full flex flex-col w-full">
      {/* Header with Month Selector */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">
          Dashboard
        </Title>
        <Select
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value)}
          style={{ width: 120 }}
          className="ml-4"
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
      </div>

      {/* Cards Section */}
      <Row gutter={[16, 16]} className="flex-shrink-0 mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card
            className="shadow-md rounded-lg"
            style={{ backgroundColor: "#fff1f0", height: "100%" }}
            bodyStyle={{ textAlign: "center", padding: "20px" }}
          >
            <Title level={3} className="m-0">
              0
            </Title>
            <p className="text-gray-500">Vé đã đặt</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            className="shadow-md rounded-lg"
            style={{ backgroundColor: "#fff1f0", height: "100%" }}
            bodyStyle={{ textAlign: "center", padding: "20px" }}
          >
            <Title level={3} className="m-0">
              0 VND
            </Title>
            <p className="text-gray-500">Doanh thu</p>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            className="shadow-md rounded-lg"
            style={{ backgroundColor: "#fff1f0", height: "100%" }}
            bodyStyle={{ textAlign: "center", padding: "20px" }}
          >
            <Title level={3} className="m-0">
              0%
            </Title>
            <p className="text-gray-500">Tỷ lệ đặt thành công</p>
          </Card>
        </Col>
      </Row>

      {/* Chart Section with Title and Legend */}
      <div className="flex-grow">
        <Card
          className="shadow-md rounded-lg h-full"
          bodyStyle={{ padding: "16px", height: "100%" }}
        >
          <div className="mb-4">
            <Title level={4} className="m-0 mb-2">
              Doanh thu {selectedMonth}
            </Title>
            <div className="flex items-center">
              <span
                className="inline-block w-4 h-2 bg-orange-500 mr-2"
                style={{ backgroundColor: "#ff7300" }}
              ></span>
              <span className="text-gray-700">Doanh thu</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 50 }} // Increased bottom margin to accommodate x-axis labels
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                interval="preserveStartEnd"
                angle={-45} // Rotate labels 45 degrees
                textAnchor="end" // Align text to the end
                height={60} // Increase height to prevent overlap
                stroke="#666"
              />
              <YAxis domain={[0, "auto"]} stroke="#666" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ff7300"
                activeDot={{ r: 6 }}
                dot={false}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
