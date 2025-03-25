const API_DOMAIN = "http://localhost:8888/";

export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path);
    const result = await response.json();
    return result;
}

export const post = async (path, options) => {
    const response = await fetch((API_DOMAIN + path), {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(options)
    });

    const result = await response.json();
    return result;
}

// Hàm mới cho upload file
export const uploadFile = async (path, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch((API_DOMAIN + path), {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            // Không set Content-Type, để browser tự xử lý với FormData
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const result = await response.json();
    return result;
}

export const del = async (path) => {
    const response = await fetch((API_DOMAIN + path), {
        method: "DELETE"
    })
    const result = await response.json();
    return result;
}

export const patch = async (path, options) => {
    const response = await fetch((API_DOMAIN + path), {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    })
    const result = await response.json();
    return result;
}

export const put = async (path, options) => {
    const response = await fetch((API_DOMAIN + path), {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(options)
    })
    const result = await response.json();
    return result;
}