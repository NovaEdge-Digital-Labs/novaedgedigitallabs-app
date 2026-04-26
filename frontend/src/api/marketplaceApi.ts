import axiosInstance from './axiosInstance';

export const marketplaceApi = {
    // Gigs
    getGigs: async (params?: { category?: string; search?: string }) => {
        const response = await axiosInstance.get('/marketplace/gigs', { params });
        return response.data;
    },
    createGig: async (gigData: any) => {
        const response = await axiosInstance.post('/marketplace/gigs', gigData);
        return response.data;
    },

    // Projects
    getProjects: async (params?: { search?: string }) => {
        const response = await axiosInstance.get('/marketplace/projects', { params });
        return response.data;
    },
    createProject: async (projectData: any) => {
        const response = await axiosInstance.post('/marketplace/projects', projectData);
        return response.data;
    },

    // Profiles
    getProfile: async (userId?: string) => {
        const url = userId ? `/marketplace/profile/${userId}` : '/marketplace/profile';
        const response = await axiosInstance.get(url);
        return response.data;
    },
    updateProfile: async (profileData: any) => {
        const response = await axiosInstance.post('/marketplace/profile', profileData);
        return response.data;
    },

    // Proposals & Hiring
    submitProposal: async (proposalData: any) => {
        const response = await axiosInstance.post('/marketplace/proposals', proposalData);
        return response.data;
    },
    hireFreelancer: async (proposalId: string) => {
        const response = await axiosInstance.post('/marketplace/hire', { proposalId });
        return response.data;
    },
    verifyEscrow: async (paymentData: any) => {
        const response = await axiosInstance.post('/marketplace/verify-escrow', paymentData);
        return response.data;
    },

    // Dashboards
    getMyJobs: async () => {
        const response = await axiosInstance.get('/marketplace/my-jobs');
        return response.data;
    },
    getMyProjects: async () => {
        const response = await axiosInstance.get('/marketplace/my-projects');
        return response.data;
    },

    // --- Job Board APIs ---

    // Job Seekers
    getAllJobs: async (params?: any) => {
        const response = await axiosInstance.get('/jobs', { params });
        return response.data;
    },
    getJobById: async (id: string) => {
        const response = await axiosInstance.get(`/jobs/${id}`);
        return response.data;
    },
    applyToJob: async (applicationData: any) => {
        const response = await axiosInstance.post('/jobs/apply', applicationData);
        return response.data;
    },
    getMyJobApplications: async () => {
        const response = await axiosInstance.get('/jobs/my/applications');
        return response.data;
    },
    getPremiumStatus: async () => {
        const response = await axiosInstance.get('/jobs/premium/status');
        return response.data;
    },
    createPremiumSeekerOrder: async () => {
        const response = await axiosInstance.post('/jobs/premium/order');
        return response.data;
    },
    verifyPremiumSeeker: async (paymentData: any) => {
        const response = await axiosInstance.post('/jobs/premium/verify', paymentData);
        return response.data;
    },

    // Employers
    getCompanyProfile: async () => {
        const response = await axiosInstance.get('/employer/profile');
        return response.data;
    },
    updateCompanyProfile: async (profileData: any) => {
        const response = await axiosInstance.post('/employer/profile', profileData);
        return response.data;
    },
    createJobOrder: async (listingType: string) => {
        const response = await axiosInstance.post('/employer/job/order', { listingType });
        return response.data;
    },
    publishJob: async (publishData: any) => {
        const response = await axiosInstance.post('/employer/job/publish', publishData);
        return response.data;
    },
};
