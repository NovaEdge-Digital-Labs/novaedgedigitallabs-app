const PROD_API_URL = "https://app.novaedgedigitallabs.in/api";
const LOCAL_API_URL = "http://localhost:5000/api";

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? LOCAL_API_URL
        : PROD_API_URL);

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

export interface SystemHealth {
    apiLatency: number;
    cpuLoad: number;
    diskUsage: number;
}

export interface LeadSubmission {
    _id: string;
    name: string;
    email: string;
    phone: string;
    service: string;
    budget?: string;
    message: string;
    source: string;
    status: "new" | "contacted" | "in-progress" | "closed-won" | "closed-lost";
    assignedTo?: string;
    notes?: string;
    createdAt: string;
}

export interface BusinessInquirySubmission {
    _id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    category: string;
    message?: string;
    status: "pending" | "contacted" | "closed" | "rejected";
    createdAt: string;
}

export interface AdminJobPost {
    _id: string;
    title: string;
    location: string;
    jobType: string;
    listingType: "Basic" | "Featured" | "Premium";
    isActive: boolean;
    expiryDate: string;
    postedBy?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    companyId?: {
        _id: string;
        name?: string;
    };
    createdAt: string;
}

export interface AdminProjectWork {
    _id: string;
    title: string;
    status: "open" | "in-progress" | "completed" | "cancelled";
    budgetRange: {
        min: number;
        max: number;
    };
    clientId?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    createdAt: string;
}

export interface AdminGigWork {
    _id: string;
    title: string;
    category: string;
    price: number;
    isActive: boolean;
    freelancerId?: {
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    createdAt: string;
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

    let response: Response;
    try {
        response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Network error";
        throw new Error(`Unable to reach API at ${BASE_URL}. ${message}`);
    }

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
    getSystemHealth: () => request("/admin/system-health"),
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

    // Leads and approval submissions
    getLeads: () => request('/admin/leads'),
    updateLead: (
        id: string,
        data: Partial<Pick<LeadSubmission, "status" | "notes" | "assignedTo">>
    ) => request(`/admin/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    getInquiries: () => request('/admin/inquiries'),
    updateInquiry: (id: string, data: Partial<Pick<BusinessInquirySubmission, "status">>) =>
        request(`/admin/inquiries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // Job posts management
    getJobs: () => request('/admin/jobs'),
    updateJob: (id: string, data: Partial<Pick<AdminJobPost, "isActive" | "listingType" | "expiryDate">>) =>
        request(`/admin/jobs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteJob: (id: string) => request(`/admin/jobs/${id}`, { method: 'DELETE' }),

    // Work management (projects/gigs)
    getWork: () => request('/admin/work'),
    updateProject: (id: string, data: Partial<Pick<AdminProjectWork, "status">>) =>
        request(`/admin/work/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteProject: (id: string) => request(`/admin/work/projects/${id}`, { method: 'DELETE' }),
    updateGig: (id: string, data: Partial<Pick<AdminGigWork, "isActive">>) =>
        request(`/admin/work/gigs/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    deleteGig: (id: string) => request(`/admin/work/gigs/${id}`, { method: 'DELETE' }),
};
