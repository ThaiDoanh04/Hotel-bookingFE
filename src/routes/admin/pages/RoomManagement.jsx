import React, { useState, useEffect } from "react";
import {post,get,uploadFile,put,del} from "../../../utils/request"

import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  message,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Empty
} from "antd";
import { PlusOutlined, UploadOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import CreateRoom from "./CreateRoom";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const RoomManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [editingHotel, setEditingHotel] = useState(null);
  const [form] = Form.useForm();
  const [images, setImages] = useState([]);
  const pageSize = 3;
  const totalPages = Math.ceil(hotels.length / pageSize);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await get('api/hotels');
        console.log(response);
        setHotels(response);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        message.error('Không thể tải dữ liệu khách sạn.');
      }
    };
    fetchHotels();
  }, []);

  const paginatedData = hotels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const showDeleteConfirm = (id) => {
    setHotelToDelete(id);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (hotelToDelete) {
        await del(`api/hotels/${hotelToDelete}`);
        
        const updatedHotels = hotels.filter((hotel) => hotel.hotelId !== hotelToDelete);
        setHotels(updatedHotels);
        
        message.success(`Đã xóa khách sạn thành công!`);
        
        const newTotalPages = Math.ceil(updatedHotels.length / pageSize);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else if (updatedHotels.length === 0) {
          setCurrentPage(1);
        }
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setIsDeleteModalVisible(false);
      setHotelToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalVisible(false);
    setHotelToDelete(null);
    message.info("Hủy xóa khách sạn!");
  };

  const handleCreateRoom = async (newRoom) => {
    try {
      const result = await createHotel(newRoom);
      
      const updatedHotels = [...hotels, result];
      setHotels(updatedHotels);
      
      message.success("Khách sạn đã được thêm thành công!");
      
      // Chuyển đến trang cuối nếu trang hiện tại đã đầy
      const newTotalPages = Math.ceil(updatedHotels.length / pageSize);
      if (hotels.length % pageSize === 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  const showCreateRoomModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleEditRoom = (hotel) => {
    setEditingHotel(hotel);
    setImages(hotel.images || []);
    form.setFieldsValue({
      title: hotel.title,
      subtitle: hotel.subtitle,
      benefits: hotel.benefits.join(', '),
      price: hotel.price,
      city: hotel.city
    });
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      const updatedHotel = {
        hotelId: editingHotel.hotelId,
        images: images,
        title: values.title,
        subtitle: values.subtitle,
        benefits: values.benefits.split(',').map(b => b.trim()),
        price: parseFloat(values.price),
        city: values.city,
        ratings: editingHotel.ratings
      };

      const result = await put(`api/hotels/${editingHotel.hotelId}`, updatedHotel);
      
      setHotels(hotels.map((hotel) => 
        hotel.hotelId === editingHotel.hotelId ? result : hotel
      ));
      
      message.success("Thông tin khách sạn đã được cập nhật!");
      setIsModalVisible(false);
      setEditingHotel(null);
      setImages([]);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Cập nhật thông tin khách sạn thất bại!");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingHotel(null);
    setImages([]);
    form.resetFields();
  };

  const handleImageChange = (info) => {
    if (info.file.status === "done") {
      setImages([URL.createObjectURL(info.file.originFileObj)]);
      message.success("Ảnh khách sạn đã được cập nhật!");
    } else if (info.file.status === "error") {
      message.error("Tải ảnh lên thất bại!");
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const imageUrl = await uploadImage(file);
      onSuccess(imageUrl);
    } catch (error) {
      onError(error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile('api/upload/image', formData);
      
      if (!response || response.error) {
        throw new Error(response?.error || 'Upload failed');
      }

      return {
        url: response.url,
        fileName: response.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      message.error(error.message || 'Tải ảnh lên thất bại!');
      throw error;
    }
  };

  const uploadMultipleImages = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await uploadFile('api/upload/images', formData);
      return response.imageUrls;
    } catch (error) {
      message.error(error.message || 'Tải ảnh lên thất bại!');
      throw error;
    }
  };

  const handleImagesChange = ({ fileList }) => {
    const successFiles = fileList.filter(file => file.status === 'done');
    const imageUrls = successFiles.map(file => file.response.url);
    setImages(imageUrls);
  };

  const deleteHotel = async (hotelId) => {
    try {
      const response = await del(`api/hotels/${hotelId}`);
      if (!response) {
        throw new Error('Xóa khách sạn thất bại');
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Xóa khách sạn thất bại');
    }
  };

  const createHotel = async (hotelData) => {
    try {
      const response = await post('api/hotels', hotelData);
      if (!response) {
        throw new Error('Tạo khách sạn thất bại');
      }
      return response;
    } catch (error) {
      throw new Error(error.message || 'Tạo khách sạn thất bại');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col w-full">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="m-0">
          Quản lý khách sạn
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateRoomModal}
          className="bg-orange-500 hover:bg-orange-600 border-none"
        >
          Tạo khách sạn
        </Button>
      </div>

      <Row gutter={[16, 8]} className="flex-grow">
        {paginatedData.length > 0 ? (
          paginatedData.map((hotel) => (
            <Col xs={24} key={hotel.hotelId} className="mb-2">
              <Card
                className="shadow-sm rounded-lg hover:shadow-md transition-all duration-300"
                bodyStyle={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px",
                }}
              >
                <div className="w-[180px] h-[120px] mr-3 overflow-hidden rounded-lg">
                  <img
                    alt={hotel.title}
                    src={hotel.images?.[0] || "https://via.placeholder.com/180x120"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/180x120";
                    }}
                  />
                </div>

                <div className="flex-1 mx-3">
                  <Title level={4} className="m-0">
                    {hotel.title}
                  </Title>
                </div>

                <div className="flex flex-col items-end">
                  <Text strong className="text-lg mb-2">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(hotel.price)}
                  </Text>
                  <div className="flex flex-col gap-1">
                    <Button
                      type="primary"
                      danger
                      onClick={() => showDeleteConfirm(hotel.hotelId)}
                      className="w-24"
                    >
                      Xóa
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => handleEditRoom(hotel)}
                      className="w-24 bg-orange-500 hover:bg-orange-600 border-none"
                    >
                      Sửa
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={24}>
            <Empty 
              description="Không có khách sạn nào" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="py-8"
            />
          </Col>
        )}
      </Row>

      {hotels.length > 0 && (
        <div className="flex justify-end items-center mt-4">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="mr-2"
            icon={<LeftOutlined />}
          />
          <Text strong>{`${currentPage} / ${totalPages || 1}`}</Text>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-2"
            icon={<RightOutlined />}
          />
        </div>
      )}

      <Modal
        title="Chỉnh sửa thông tin khách sạn"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu thay đổi"
        cancelText="Hủy bỏ"
        okButtonProps={{
          className: "bg-orange-500 hover:bg-orange-600 border-none",
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Hình ảnh khách sạn">
            <div className="flex items-center flex-wrap gap-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Hotel Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
              <Upload
                showUploadList={false}
                customRequest={customRequest}
                onChange={handleImagesChange}
              >
                <Button icon={<UploadOutlined />}>Thay đổi ảnh</Button>
              </Upload>
            </div>
          </Form.Item>

          <Form.Item
            label="Tên khách sạn"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên khách sạn!" }]}
          >
            <Input placeholder="Tên khách sạn" />
          </Form.Item>

          <Form.Item
            label="Mô tả ngắn"
            name="subtitle"
            rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn!" }]}
          >
            <Input.TextArea rows={2} placeholder="Mô tả ngắn về khách sạn" />
          </Form.Item>

          <Form.Item
            label="Tiện ích"
            name="benefits"
            rules={[{ required: true, message: "Vui lòng nhập các tiện ích!" }]}
            tooltip="Nhập các tiện ích, phân cách bằng dấu phẩy"
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Ví dụ: wifi, spa, công viên" 
            />
          </Form.Item>

          <Form.Item
            label="Giá phòng (VND)"
            name="price"
            rules={[
              { required: true, message: "Vui lòng nhập giá phòng!" },
              { type: "number", min: 0, message: "Giá phòng không được âm!" }
            ]}
          >
            <Input 
              type="number" 
              placeholder="Giá phòng"
              min={0}
              step={100000}
            />
          </Form.Item>

          <Form.Item
            label="Thành phố"
            name="city"
            rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}
          >
            <Input placeholder="Nhập tên thành phố" />
          </Form.Item>
        </Form>
      </Modal>

      <CreateRoom
        isModalVisible={isCreateModalVisible}
        setIsModalVisible={setIsCreateModalVisible}
        onCreate={handleCreateRoom}
      />

      <Modal
        title="Xác nhận xóa khách sạn"
        open={isDeleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCancelDelete}
        okText="Có"
        cancelText="Không"
        okButtonProps={{
          danger: true,
        }}
      >
        <p>Bạn có muốn xóa khách sạn không?</p>
      </Modal>
    </div>
  );
};

export default RoomManagement;
