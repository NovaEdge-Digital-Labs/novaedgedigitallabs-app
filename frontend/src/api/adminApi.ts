import axiosInstance from './axiosInstance';

export const adminApi = {
    getStats: async () => {
        const response = await axiosInstance.get('/admin/stats');
        return response.data;
    },

    getUsers: async () => {
        const response = await axiosInstance.get('/admin/users');
        return response.data;
    },

    updateUser: async (id: string, userData: any) => {
        const response = await axiosInstance.put(`/admin/user/${id}`, userData);
        return response.data;
    },
};
