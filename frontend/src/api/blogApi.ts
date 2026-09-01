import api from './axiosInstance';

export interface BlogSection {
    title?: string;
    content?: string;
    image?: string;
}

export interface Blog {
    _id: string;
    id?: string;
    title: string;
    category?: string;
    author?: string;
    publishedAt?: string;
    readTime?: string;
    imageUrl?: string;
    excerpt?: string;
    content?: string;
    tags?: string[];
    sections?: BlogSection[];
    authorBio?: string;
    keyTakeaways?: string[];
    body?: any[];
    coverImage?: { url: string };
    createdAt?: string;
    updatedAt?: string;
}

const blogApi = {
    getBlogs: async () => {
        try {
            const response = await api.get('/blogs');
            return response.data;
        } catch (error: any) {
            console.error('API Error in getBlogs:', error);
            return { success: false, data: [] };
        }
    },
    getBlogById: async (id: string) => {
        try {
            const response = await api.get(`/blogs/${id}`);
            return response.data;
        } catch (error: any) {
            console.error('API Error in getBlogById:', error);
            return { success: false, data: null };
        }
    }
};

export default blogApi;
