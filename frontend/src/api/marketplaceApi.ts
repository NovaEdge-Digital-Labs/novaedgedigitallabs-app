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
    updateGig: async (id: string, gigData: any) => {
        const response = await axiosInstance.put(`/marketplace/gigs/${id}`, gigData);
        return response.data;
    },
    deleteGig: async (id: string) => {
        const response = await axiosInstance.delete(`/marketplace/gigs/${id}`);
        return response.data;
    },
    getGigById: async (id: string) => {
        const response = await axiosInstance.get(`/marketplace/gigs/${id}`);
        return response.data;
    },
    orderGig: async (id: string) => {
        const response = await axiosInstance.post(`/marketplace/gigs/${id}/order`);
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
    updateProjectStatus: async (projectId: string, status: string) => {
        const response = await axiosInstance.patch(`/marketplace/projects/${projectId}/status`, { status });
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
    getProposals: async (projectId: string) => {
        const response = await axiosInstance.get(`/marketplace/projects/${projectId}/proposals`);
        return response.data;
    },
    submitProposal: async (proposalData: any) => {
        const response = await axiosInstance.post('/marketplace/proposals', proposalData);
        return response.data;
    },
    hireFreelancer: async (proposalId: string) => {
        const response = await axiosInstance.post('/marketplace/hire', { proposalId });
        return response.data;
    },
    /**
     * `contractId` is intentionally not part of this payload. The server
     * resolves the contract from the escrow transaction the order was created
     * for; sending one let a caller fund a contract they hadn't paid for.
     */
    verifyEscrow: async (payment: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        contractId?: string;
    }) => {
        const response = await axiosInstance.post('/marketplace/verify-escrow', payment);
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
    getJobsByIds: async (ids: string[]) => {
        const response = await axiosInstance.post('/jobs/batch', { ids });
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
    getEmployerApplicants: async () => {
        const response = await axiosInstance.get('/employer/applicants');
        return response.data;
    },
    updateApplicantStatus: async (id: string, status: string) => {
        const response = await axiosInstance.patch(`/employer/applicants/${id}/status`, { status });
        return response.data;
    },
    getMyPostedJobs: async () => {
        const response = await axiosInstance.get('/employer/jobs');
        return response.data;
    },
    updateEmployerJob: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/employer/job/${id}`, data);
        return response.data;
    },
    deleteEmployerJob: async (id: string) => {
        const response = await axiosInstance.delete(`/employer/job/${id}`);
        return response.data;
    },
    getPublicPricing: async () => {
        const response = await axiosInstance.get('/jobs/pricing');
        return response.data;
    },
};
