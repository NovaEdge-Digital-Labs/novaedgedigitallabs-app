# NovaEdge Digital Labs — Complete Feature Specification

This document provides a comprehensive list of all features, tools, and capabilities built into the **NovaEdge Digital Labs** ecosystem across the Mobile App (`/frontend`), Backend API (`/backend`), and Admin Control Webapp (`/admin-webapp`).

---

## 🔐 1. User Authentication & Account Management
- **Multi-Role Authentication:** User accounts support roles for **Job Seekers**, **Employers**, **Freelancers**, and **Admins**.
- **Secure Auth Flow:** JWT-based login, registration, password reset via OTP/email, and secure session persistence.
- **Profile Customization:**
  - Standard user profile management with bio, skills, and portfolio links.
  - **Company Profile:** Dedicated employer branding, company bio, site link, and job postings list.
  - **Freelancer Profile:** Showcase completed projects, hourly rates, skill tags, and gig listings.
- **Privacy & Security Settings:** Password change, active session tracking, multi-factor security controls.
- **Personalized Workspace ("My Workspace"):** Unified dashboard for tracking active job applications, enrolled courses, purchased digital store items, and saved jobs.

---

## 📚 2. EdTech & Learning Hub (Academy)
- **Course Feed & Discovery:** Categorized course catalog with search, filtering by level/topic, and rating summaries.
- **Course Detail & Syllabus:** Comprehensive overview, video lesson counts, instructor details, price/enrollment options.
- **Lecture Video Player:** In-app video streaming player (`expo-video` & YouTube iframe integration) with progress tracking.
- **My Courses:** Enrolled courses overview with completion percentage and resume-learning quick access.
- **Certificate Generation:** Automated PDF certificate generation upon course completion (backed by Puppeteer backend).

---

## 💼 3. Job Board & Recruitment Ecosystem
- **Job Feed & Advanced Search:** Filter jobs by type (Full-time, Part-time, Remote, Internship), salary range, experience, and keywords.
- **Job Detail & Save Job:** Detailed job breakdown, company info, requirement checklist, and one-tap bookmarking.
- **Candidate Application Flow:** In-app application form with resume attachment and custom pitch.
- **My Applications Tracker:** Track status of submitted job applications (Pending, Under Review, Interview, Accepted, Rejected).
- **Employer Job Posting (`PostJobScreen`):** Employers can create, edit, and publish job listings.
- **Applicant Management (`EmployerApplicantsScreen`):** Employers can review candidates, download resumes, and update application status.
- **My Posted Jobs:** Manage active, closed, and draft job postings.

---

## 🛠️ 4. Freelance Marketplace & Gigs
- **Freelance Marketplace:** Discover freelance services and projects across design, development, marketing, and content writing.
- **Gig Details & Ordering:** Detailed service descriptions, tier pricing, delivery timelines, and direct booking.
- **Create Gig (`CreateGigScreen`):** Freelancers can showcase services with pricing tiers and media previews.
- **Create Project (`CreateProjectScreen`):** Clients/Employers can post contract projects with budget caps.
- **Proposal System (`ProposalScreen`):** Freelancers can submit competitive proposals with bid amount and delivery ETA.
- **Project Details & Milestones:** Track ongoing freelance project milestones and deliverable submissions.

---

## 🛒 5. Digital Store & Asset Marketplace
- **Digital Product Store:** Catalog of downloadable templates, software source code, UI kits, and digital tools.
- **Product Details:** Rich preview media, feature list, reviews, and instant checkout.
- **Service Booking:** Order digital agency services (Web Development, Mobile App Dev, SEO, Branding).
- **My Purchases:** Digital downloads manager for instant file retrieval and invoice generation.

---

## 🧰 6. Built-in Developer & Business Utilities (Mini-Apps)
The app includes 10 native client-side developer and business utility tools:
1. **Invoice Generator:** Create professional PDF business invoices on-the-go.
2. **Resume Builder:** Interactive resume builder for job seekers.
3. **QR Code Generator:** Custom QR code creation for links, text, and Wi-Fi.
4. **JSON Formatter & Validator:** Beautify, minify, and validate JSON payloads.
5. **JWT Decoder:** Decode and inspect JSON Web Tokens safely.
6. **Base64 Encoder/Decoder:** Convert text and binary payloads to/from Base64.
7. **RegEx Tester:** Live testing for regular expressions with instant highlight match.
8. **Image Compressor:** Client-side image optimization and file size reduction.
9. **EMI Calculator:** Loan EMI and interest calculator with repayment schedule breakdown.
10. **GST Calculator:** Indian Goods & Services Tax (GST) inclusive/exclusive calculation.

---

## 📈 7. B2B Business Inquiries & Lead Generation
- **Business Inquiry Form (`BusinessInquiryScreen`):** Submit custom enterprise software development queries directly to NovaEdge Digital Labs.
- **Lead Generation Form (`LeadFormScreen`):** Capture prospective client leads with contact details and project requirements.
- **Automated Email Alerts:** Instant SMTP notifications sent to NovaEdge admins upon new lead/inquiry submission.
- **Lead Status Pipeline:** Backend status management (New, Contacted, In Progress, Closed).

---

## 🔑 8. Developer API & Open Platform
- **API Keys Dashboard (`ApiDashboardScreen`):** Generate, inspect, and revoke developer API keys.
- **Rate Limit Tracking & Logs:** View public API usage metrics (`ApiCallLog`).
- **Developer Documentation:** Access endpoint specs for public platform APIs (`/api/v1`).

---

## 💳 9. Monetization & Payment System
- **Razorpay Integration:** Secure multi-payment gateway (UPI, Cards, NetBanking, Wallets).
- **Premium Subscriptions (`SubscriptionScreen` / `PremiumUpgradeScreen`):** Tiered subscription plans unlocking premium courses, unlimited job applications, and priority badge placement.
- **In-App Invoicing:** Generate and download PDF invoices (`test_send_invoice` backend script & client generator).

---

## 🎁 10. Gamification & Growth (Referral & Loyalty)
- **Refer & Earn (`ReferEarnScreen`):** Unique user referral link/code generation with credit reward tracking.
- **NovaEdge Credits / Rewards:** Daily login bonus points redeemable for store discounts and premium features.
- **Notifications System:** Real-time push notifications (`expo-notifications`) for course updates, job alerts, and special offers.

---

## 🖥️ 11. Admin Control Webapp (`/admin-webapp`)
Full-featured Next.js control panel for platform administration:
- **Executive Dashboard:** Live statistics (Users, Revenue, Active Courses, Tool Usage).
- **User Management (`/users`):** View, edit, upgrade plan, activate/deactivate, or delete user accounts.
- **Store & Product Management (`/store`):** Full CRUD interface for digital products and agency services.
- **Course Administration (`/academy`):** Manage courses, modules, and video links.
- **Job & Freelance Moderation (`/jobs`, `/work`):** Moderate jobs, gigs, and posted contracts.
- **Lead & Business Inquiry Management (`/leads`):** View captured leads, update resolution status.
- **Analytics Center (`/analytics`):** Track sessions, bounce rate, retention metrics, and export CSV reports.
- **Domain & SSL Management (`/domain`):** Domain allow-listing and DNS configuration.
- **Platform Settings (`/settings`):** 8-tab settings suite (Security, API Keys, Team, Cloud Sync, Notifications, Database, Appearance).

---

## 🚀 12. User Retention & Engagement Strategy Ideas

To maximize app retention (preventing users from uninstalling and ensuring daily usage):

1. **Smart & Personalized Push Notifications**
   - *Value-driven alerts:* "New Digital Marketing Course Added!" or "Exclusive 20% off on your next project."
   - *Activity-driven reminders:* Gentle follow-up notifications for incomplete courses or draft job posts.

2. **Daily Login Bonus & Rewards**
   - *Daily Streak Coins:* Collect daily NovaEdge coins to redeem against premium templates or service discounts.
   - *Referral Incentives:* Earn credits whenever invited friends sign up or complete a purchase.

3. **App-Exclusive Resources & Offers**
   - Free premium downloadable cheat-sheets, UI kits, and PDF guides exclusive to app users.
   - App-only checkout discount codes (e.g. `APP10`).

4. **Live In-App Support & Chatbot**
   - Instant WhatsApp support integration or AI chatbot for real-time project inquiries.

5. **Community Feed & Industry Updates**
   - Weekly tech & digital news feed inside the app (`BlogScreen` & `BlogDetailScreen`) to keep users coming back to learn.