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
  Empty,
  Table,
  Popconfirm
} from "antd";
import { PlusOutlined, UploadOutlined, LeftOutlined, RightOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
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
  const [uploadStatus, setUploadStatus] = useState({ loading: false, success: false, error: null });

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

  const handleCreateHotel = async (newHotel) => {
    try {
      setHotels([...hotels, newHotel]);
      message.success('Tạo khách sạn thành công!');
      setIsCreateModalVisible(false);
    } catch (error) {
      message.error(error.message || 'Tạo khách sạn thất bại');
    }
  };

  const showCreateRoomModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleEditRoom = (hotel) => {
    setEditingHotel(hotel);
    
    // Reset upload status
    setUploadStatus({ loading: false, success: false, error: null });
    
    // Đảm bảo images là một mảng
    let currentImages = [];
    
    if (hotel.images) {
      if (Array.isArray(hotel.images)) {
        currentImages = [...hotel.images];
      } else {
        currentImages = [hotel.images];
      }
    }
    
    console.log("Đang sửa hotel với ảnh:", currentImages);
    
    // Đặt images cho state
    setImages(currentImages);
    
    form.setFieldsValue({
      title: hotel.title,
      subtitle: hotel.subtitle,
      benefits: Array.isArray(hotel.benefits) ? hotel.benefits.join(', ') : '',
      price: hotel.price,
      city: hotel.city
    });
    
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (parseFloat(values.price) <= 0) {
        message.error("Giá phòng phải lớn hơn 0!");
        return;
      }
      
      console.log("Current state images before save:", images);
      
      if (!images || images.length === 0) {
        message.warning("Vui lòng tải lên ít nhất một ảnh cho khách sạn!");
        return;
      }
      
      const processedImages = images.map(img => {
        if (typeof img === 'object' && img.url) {
          return img.url;
        }
        return img;
      });
      
      console.log("Sending updated hotel data:", {
        hotelId: editingHotel.hotelId,
        images: processedImages,
        title: values.title,
        subtitle: values.subtitle,
        benefits: values.benefits.split(',').map(b => b.trim()),
        price: parseFloat(values.price),
        city: values.city,
        ratings: editingHotel.ratings
      });
      const result = await put(`api/hotels/${editingHotel.hotelId}`, {
        hotelId: editingHotel.hotelId,
        images: processedImages,
        title: values.title,
        subtitle: values.subtitle,
        benefits: values.benefits.split(',').map(b => b.trim()),
        price: parseFloat(values.price),
        city: values.city,
        ratings: editingHotel.ratings
      });
      
      setHotels(hotels.map((hotel) => 
        hotel.hotelId === editingHotel.hotelId ? result : hotel
      ));
      
      message.success("Thông tin khách sạn đã được cập nhật!");
      setIsModalVisible(false);
      setEditingHotel(null);
      setImages([]);
      form.resetFields();
    } catch (error) {
      console.error("Lỗi cập nhật khách sạn:", error);
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
    console.log("Image change info:", info);
    
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại.`);
      return;
    }
    
    if (info.file.status === 'done') {
      const imageUrl = info.file.response?.url || info.file.response?.imageUrl;
      
      if (imageUrl) {
        setImages([imageUrl]);
        message.success('Ảnh đã được tải lên thành công!');
        console.log("Đã cập nhật state images với URL mới:", imageUrl);
      } else {
        message.warning('Không nhận được URL ảnh từ server!');
      }
    }
    
    if (info.file.status === 'removed') {
      setImages([]);
      console.log("Đã xóa ảnh và reset state images");
    }
  };

  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      onProgress({ percent: 30 });
      message.loading({ content: 'Đang tải ảnh lên...', key: 'uploadImage' });
      
      const imageUrl = await uploadImage(file);
      
      setImages([imageUrl]);
      
      onProgress({ percent: 100 });
      onSuccess({ url: imageUrl, name: file.name });
      message.success({ content: 'Đã tải ảnh lên thành công!', key: 'uploadImage' });
      
      console.log("Upload thành công, URL ảnh:", imageUrl);
      console.log("State images hiện tại:", images);
    } catch (error) {
      onError(error);
      message.error({ content: 'Tải ảnh lên thất bại!', key: 'uploadImage' });
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploadStatus({ loading: true, success: false, error: null });
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile('api/upload/image', file);
      console.log("API Upload Response:", response);
      
      if (!response) {
        throw new Error('Không nhận được phản hồi từ server');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const imageUrl = response.imageUrl || response.url;
      if (!imageUrl) {
        throw new Error('Không nhận được URL ảnh từ server');
      }
      
      setUploadStatus({ loading: false, success: true, error: null });
      return imageUrl;
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      setUploadStatus({ loading: false, success: false, error: error.message });
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
          <Form.Item
            label="Ảnh khách sạn"
            required
            tooltip="Kích thước tối đa: 5MB. Định dạng: JPG, PNG"
          >
            <div>
              {uploadStatus.loading && <div className="mb-2 text-blue-500">Đang tải ảnh lên...</div>}
              {uploadStatus.success && <div className="mb-2 text-green-500">Tải ảnh thành công!</div>}
              {uploadStatus.error && <div className="mb-2 text-red-500">Lỗi: {uploadStatus.error}</div>}
              
              <Upload
                listType="picture-card"
                fileList={images.map((url, index) => {
                  if (typeof url === 'string') {
                    return {
                      uid: `-${index}`,
                      name: `image-${index}.jpg`,
                      status: 'done',
                      url: url,
                      thumbUrl: url
                    };
                  }
                  return {
                    ...url,
                    uid: `-${index}`,
                    name: url.fileName || `image-${index}.jpg`,
                    status: 'done',
                    thumbUrl: url.url
                  };
                })}
                customRequest={customRequest}
                onChange={handleImageChange}
                accept=".jpg,.jpeg,.png"
                maxCount={1}
                showUploadList={{
                  showPreviewIcon: true,
                  showRemoveIcon: true,
                  showDownloadIcon: false
                }}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  const isLt5M = file.size / 1024 / 1024 < 5;

                  if (!isImage) {
                    message.error('Chỉ được tải lên file ảnh!');
                    return false;
                  }

                  if (!isLt5M) {
                    message.error('Ảnh phải nhỏ hơn 5MB!');
                    return false;
                  }

                  return true;
                }}
              >
                {images.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh mới</div>
                  </div>
                )}
              </Upload>
            </div>
            
            {images.length > 0 && (
              <div className="mt-2">
                <div className="text-sm text-gray-500 mb-1">Ảnh hiện tại:</div>
                <div className="border border-gray-200 rounded p-2 inline-block">
                  <img 
                    src={typeof images[0] === 'string' ? images[0] : images[0].url} 
                    alt="Current" 
                    style={{ maxHeight: '100px' }} 
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            
            <div className="text-sm mt-2 text-gray-500">
              {images.length > 0 
                ? 'Nhấp vào nút + để thay đổi ảnh hoặc nhấp vào ảnh để xem trước/xóa' 
                : 'Vui lòng tải lên ít nhất một ảnh cho khách sạn'}
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
            name="price"
            label="Giá phòng"
            rules={[
              { required: true, message: 'Vui lòng nhập giá phòng!' },
              { 
                validator: (_, value) => {
                  const price = parseFloat(value);
                  if (isNaN(price)) {
                    return Promise.reject('Giá phải là một số!');
                  }
                  if (price <= 0) {
                    return Promise.reject('Giá phải lớn hơn 0!');
                  }
                  return Promise.resolve();
                } 
              }
            ]}
          >
            <Input 
              type="number"
              min={1}
              step={10000}
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
        onCreate={handleCreateHotel}
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
