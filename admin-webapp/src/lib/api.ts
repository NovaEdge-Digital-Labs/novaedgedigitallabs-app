const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    plan: string;
    isActive: boolean;
    createdAt: string;
}

export interface Service {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    icon: string;
    category: string;
    pricing: {
        startingPrice: number;
        currency: string;
        model: string;
    };
    features: string[];
    technologies: string[];
    deliverables: string[];
    thumbnail: string;
    estimatedDuration: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    createdAt: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    instructor: {
        name: string;
        bio?: string;
        avatar?: string;
    };
    price: number;
    originalPrice?: number;
    category: string;
    thumbnail: string;
    previewVideoUrl?: string;
    lectures: {
        title: string;
        duration: string;
        videoUrl: string;
        freePreview: boolean;
    }[];
    totalDuration?: string;
    enrolledCount: number;
    rating: number;
    tags: string[];
    createdAt: string;
}

export interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    zipUrl: string;
    isActive: boolean;
    totalSales: number;
    averageRating: number;
    tags?: string[];
    features?: string[];
    createdAt: string;
}

export interface ApiKey {
    _id: string;
    key: string;
    name: string;
    userId: {
        _id: string;
        email: string;
    };
    monthlyLimit: number;
    monthlyCalls: number;
    isActive: boolean;
    createdAt: string;
}

export interface Analytics {
    avgSessionDuration: number;
    bounceRate: number;
    retentionRate: number;
    activeNodes: number;
    trafficSources: {
        label: string;
        value: number;
    }[];
    regionalDistribution: {
        country: string;
        value: string;
        color: string;
    }[];
}

export interface PlatformConfig {
    siteName: string;
    supportEmail: string;
    description: string;
    maintenanceMode: boolean;
    brandPrimaryColor: string;
    colorScheme: string;
    typography: string;
    enable2FA: boolean;
    strongPassword: boolean;
    sessionTimeout: boolean;
    ipWhitelisting: boolean;
    [key: string]: string | number | boolean | object | undefined;
}

export const authApi = {
    login: (data: Record<string, unknown>) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),
};

async function request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("auth-error", { detail: "Session expired" }));
            const error = await response.json().catch(() => ({ message: "Session expired" }));
            throw new Error(error.message || "Session expired");
        }
        const error = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(error.message || "Request failed");
    }

    return response.json();
}

export const adminApi = {
    getStats: () => request("/admin/stats"),
    getUsers: () => request("/admin/users"),
    updateUser: (userId: string, data: { role?: string; plan?: string; isActive?: boolean }) =>
        request(`/admin/user/${userId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteUser: (userId: string) =>
        request(`/admin/user/${userId}`, {
            method: "DELETE",
        }),
    createUser: (data: Partial<User> & { password?: string }) =>
        request("/admin/user", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    getPlatformConfig: () => request("/admin/platform-config"),
    updatePlatformConfig: (data: PlatformConfig) =>
        request("/admin/platform-config", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    getAnalytics: () => request("/admin/analytics"),
    refreshAnalytics: () =>
        request("/admin/analytics/refresh", {
            method: "POST",
        }),
    // Products management
    getProducts: () => request("/admin/products"),
    createProduct: (data: Partial<Product>) =>
        request("/admin/products", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateProduct: (id: string, data: Partial<Product>) =>
        request(`/admin/products/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    deleteProduct: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    
    // API Keys
    getApiKeys: () => request('/admin/api-keys'),
    createApiKey: (data: { userId: string, name?: string, monthlyLimit?: number }) => request('/admin/api-keys', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    revokeApiKey: (id: string) => request(`/admin/api-keys/${id}`, { method: 'DELETE' }),

    // Services management
    getServices: () => request('/admin/services'),
    createService: (data: Partial<Service>) => request('/admin/services', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateService: (id: string, data: Partial<Service>) => request(`/admin/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteService: (id: string) => request(`/admin/services/${id}`, { method: 'DELETE' }),

    // Courses (Academy) management
    getCourses: () => request('/admin/courses'),
    createCourse: (data: Partial<Course>) => request('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateCourse: (id: string, data: Partial<Course>) => request(`/admin/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteCourse: (id: string) => request(`/admin/courses/${id}`, { method: 'DELETE' }),
};
