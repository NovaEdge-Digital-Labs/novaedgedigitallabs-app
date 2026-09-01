# Application Overview: NovaEdge Digital Labs

NovaEdge Digital Labs is a comprehensive, multi-role digital ecosystem designed to combine a learning platform (EdTech), a recruitment portal, a freelance gig marketplace, a digital products marketplace, developer/business tools, and B2B enterprise client acquisition, all managed through a centralized administrator control web application.

Here is the detailed specification of all user-facing and administrator-facing features:

---

## 🔐 1. User Authentication & Account Management
*   **Multi-Role Account System:** The platform supports distinct user roles: Job Seekers, Employers, Freelancers, and System Administrators.
*   **Secure Authentication Flow:** Supports registration, login, session persistence, and password reset operations.
*   **Role-Specific Profile Customization:**
    *   *Standard/Job Seeker Profile:* Showcase resume, bio, skills, and portfolio links.
    *   *Company/Employer Profile:* Dedicated employer branding, company bio, website link, and a list of active job postings.
    *   *Freelancer Profile:* Showcase completed projects, hourly rates, skill tags, and gig listings.
*   **Personalized Workspace ("My Workspace"):** A unified dashboard where users can track their active job applications, enrolled courses, purchased digital store items, saved jobs, and account-specific metrics.

---

## 📚 2. EdTech & Learning Hub (Academy)
*   **Course Discovery & Syllabus:** A categorized course catalog with search, filtering by level/topic, course overview, details, video lesson counts, instructor details, pricing, and ratings.
*   **Lecture Video Player:** In-app video streaming player for lesson progression with active learning progress tracking.
*   **My Courses:** Enrolled courses overview displaying progress completion percentages and a "resume-learning" quick access option.
*   **Certificate Generation:** Automated generation of official completion certificates in PDF format when a user completes all lessons in a course.

---

## 💼 3. Job Board & Recruitment Ecosystem
*   **Job Feed & Advanced Search:** Advanced filtering by job type (Full-time, Part-time, Remote, Internship), salary range, experience level, and keywords. Bookmarking/saving jobs is also supported.
*   **Candidate Application Flow:** In-app application forms where job seekers can upload resumes, add portfolio links, and write cover pitches.
*   **Applications Tracker:** A pipeline dashboard for applicants to track the status of their submissions (Pending, Under Review, Interview, Accepted, Rejected).
*   **Employer Recruitment Dashboard:**
    *   *Job Creation:* Employers can draft, edit, and publish job listings.
    *   *Applicant Management:* Employers can review candidates, download resumes, evaluate profile metrics, and update candidate statuses.

---

## 🛠️ 4. Freelance Marketplace & Gigs
*   **Service Catalog (Gigs):** Freelancers can showcase and list specific services with tier pricing (e.g., Basic, Standard, Premium), delivery timelines, and media previews. Users can order these services directly.
*   **Project Posting & Bidding System:**
    *   Clients or employers can post freelance contract projects with budget caps.
    *   Freelancers can submit proposals containing bid amounts, cover pitches, and estimated delivery dates.
*   **Milestones & Deliverable Tracker:** Collaborative space to track active project milestones and upload/download project deliverables.

---

## 🛒 5. Digital Store & Asset Marketplace
*   **Digital Products:** A store featuring templates, software source code, UI kits, and digital tool downloads.
*   **Agency Service Booking:** Direct channel for users to purchase custom digital services offered by the platform (Web/Mobile Development, SEO, Branding).
*   **Downloads & Invoicing:** A "My Purchases" section where users download purchased digital files, review order histories, and download invoices.

---

## 🧰 6. Built-in Developer & Business Utilities (Mini-Apps)
The application includes 10 native, client-side developer and business tools:
1.  **Invoice Generator:** Interactive tool to create professional PDF business invoices on-the-go.
2.  **Resume Builder:** Step-by-step interactive builder to generate resumes for job seekers.
3.  **QR Code Generator:** Creates custom QR codes for URLs, text payloads, and Wi-Fi credentials.
4.  **JSON Formatter & Validator:** Minifies, beautifies, and validates JSON payloads.
5.  **JWT Decoder:** Safely decodes and inspects JSON Web Tokens (JWT) client-side.
6.  **Base64 Encoder/Decoder:** Converts text and binary payloads to and from Base64 encoding.
7.  **RegEx Tester:** Live testing for regular expressions with instant highlighting of matches.
8.  **Image Compressor:** Client-side image optimization and file size reduction.
9.  **EMI Calculator:** Loan EMI and interest calculator with a monthly repayment schedule breakdown.
10. **GST Calculator:** Simple calculator for Goods & Services Tax (GST) inclusive and exclusive calculations.

---

## 📈 7. B2B Business Inquiries & Lead Generation
*   **Business Inquiry Form:** Prospective enterprise clients can submit specialized software development or digital transformation project queries.
*   **Lead Capturing System:** Gathers client contact information, budget scope, and functional project requirements.
*   **Admin Notifications:** Automatically triggers instant alerts to internal staff when a new B2B inquiry is submitted.

---

## 🔑 8. Developer API & Open Platform
*   **API Key Management Dashboard:** Allows developer-mode users to generate, inspect, and revoke credentials for public platform APIs.
*   **Usage Tracking & Logs:** View public API rate limit metrics and transaction logs.
*   **API Documentation Hub:** Access and browse endpoint specifications for developers.

---

## 💳 9. Monetization & Payment System
*   **Secure Payment Integration:** Integrated payment flow supporting UPI, Credit/Debit cards, NetBanking, and mobile wallets.
*   **Premium Subscriptions:** Tiered plans that unlock premium academy courses, unlimited job applications, and profile priority badges.
*   **In-App Billing:** Automatic generation and storage of downloadable PDF receipt/invoice documents for all payments.

---

## 🎁 10. Gamification & Growth Systems
*   **Refer & Earn Program:** Generates unique referral links/codes for users to invite others, earning rewards upon successful registrations.
*   **Credits / Loyalty Rewards:** Daily login bonuses and action-triggered credits redeemable for store checkout discounts or premium feature unlocks.
*   **Notification Engine:** Real-time push notifications alerting users about course updates, job application changes, and special marketplace offers.

---

## 🖥️ 11. Admin Control Center (Web Portal)
A centralized web administration portal designed for managers and platform moderators:
*   **Executive Dashboard:** Real-time tracking of new user sign-ups, active courses, tool usage metrics, and revenue analytics.
*   **User Directory Management:** Ability to view profiles, update plan tiers, ban/unban users, and promote/demote roles.
*   **Store & Product Inventory:** Full controls (Create, Read, Update, Delete) over digital products, templates, and service packages.
*   **Academy Course Creator:** Manage learning courses, upload video modules, edit syllabi, and track student enrollments.
*   **Moderation System:** Moderate active job postings, freelance contract listings, and project proposals.
*   **Pipeline & Lead Tracker:** Board to manage active B2B enterprise leads and update resolution stages.
*   **Platform Settings Panel:** Configuration panel for managing system security, team credentials, developer API keys, database backups, and interface appearance parameters.
