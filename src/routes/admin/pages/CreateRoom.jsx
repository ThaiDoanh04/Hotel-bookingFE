// src/components/CreateRoom.jsx
import React, { useState } from "react";
import {post,uploadFile} from "../../../utils/request"
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Button,
  message,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const CreateRoom = ({ isModalVisible, setIsModalVisible, onCreate }) => {
  const [form] = Form.useForm();
  const [images, setImages] = useState([]);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile('api/upload/image', file);
      
      if (!response || response.error) {
        throw new Error(response?.error || 'Upload failed');
      }

      return {
        url: response.imageUrl,
        fileName: file.name,
        size: file.size,
        type: file.type
      };
    } catch (error) {
      message.error(error.message || 'Tải ảnh lên thất bại!');
      throw error;
    }
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    try {
      const result = await uploadImage(file);
      onSuccess(result);
    } catch (error) {
      onError(error);
    }
  };

  const handleImagesChange = ({ fileList }) => {
    const successFiles = fileList.filter(file => file.status === 'done');
    const imageUrls = successFiles.map(file => ({
      url: file.response.url,
      fileName: file.response.fileName,
      size: file.response.size,
      type: file.response.type
    }));
    setImages(imageUrls);
  };

  const handleCreateRoom = async () => {
    try {
      const values = await form.validateFields();
      const newRoom = {
        images: images.map(img => img.url),
        title: values.title,
        subtitle: values.subtitle,
        benefits: values.benefits.split(',').map(benefit => benefit.trim()),
        price: parseFloat(values.price),
        city: values.city
      };

      const createdRoom = await post('api/hotels', newRoom);
      
      onCreate(createdRoom);
      message.success("Tạo hotel thành công!");
      setIsModalVisible(false);
      setImages([]);
      form.resetFields();
    } catch (error) {
      message.error(error.message || "Tạo phòng thất bại!");
    }
  };

  return (
    <Modal
      title="Tạo phòng mới"
      open={isModalVisible}
      onOk={handleCreateRoom}
      onCancel={() => {
        setIsModalVisible(false);
        setImages([]);
        form.resetFields();
      }}
      okText="Tạo"
      cancelText="Hủy bỏ"
      okButtonProps={{
        className: "bg-indigo-600 hover:bg-indigo-700 border-none",
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          label="Hình ảnh phòng"
          name="images"
          rules={[{ required: true, message: "Vui lòng tải lên ít nhất 1 ảnh!" }]}
        >
          <Upload
            listType="picture-card"
            multiple={true}
            onChange={handleImagesChange}
            customRequest={customRequest}
            maxCount={5}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith('image/');
              const isLt10M = file.size / 1024 / 1024 < 10;

              if (!isImage) {
                message.error('Chỉ được tải lên file ảnh!');
                return false;
              }

              if (!isLt10M) {
                message.error('Ảnh phải nhỏ hơn 10MB!');
                return false;
              }

              return true;
            }}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Tải ảnh</div>
            </div>
          </Upload>
        </Form.Item>

        {/* Tiêu đề */}
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
        >
          <Input placeholder="Tiêu đề phòng" />
        </Form.Item>

        {/* Mô tả ngắn */}
        <Form.Item
          label="Mô tả ngắn"
          name="subtitle"
          rules={[{ required: true, message: "Vui lòng nhập mô tả ngắn!" }]}
        >
          <Input placeholder="Mô tả ngắn về phòng" />
        </Form.Item>

        {/* Tiện ích */}
        <Form.Item
          label="Tiện ích (phân cách bằng dấu phẩy)"
          name="benefits"
          rules={[{ required: true, message: "Vui lòng nhập các tiện ích!" }]}
        >
          <TextArea 
            rows={3} 
            placeholder="VD: WiFi miễn phí, Điều hòa, TV" 
          />
        </Form.Item>

        {/* Giá phòng */}
        <Form.Item
          label="Giá phòng (VND)"
          name="price"
          rules={[
            { required: true, message: "Vui lòng nhập giá phòng!" },
            { type: "number", min: 0, message: "Giá phòng không được âm!" }
          ]}
        >
          <InputNumber 
            className="w-full"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder="Giá phòng"
          />
        </Form.Item>

        {/* Thành phố */}
        <Form.Item
          label="Thành phố"
          name="city"
          rules={[{ required: true, message: "Vui lòng nhập thành phố!" }]}
        >
          <Input placeholder="Thành phố" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateRoom;
