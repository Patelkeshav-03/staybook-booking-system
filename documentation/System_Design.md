# Staybook - System Design & Requirement Analysis

## 1. Business Model Study (Booking Marketplace Model)

Staybook operates on a robust multi-vendor marketplace model, drawing inspiration from industry giants like Booking.com and Airbnb. The platform serves as an intermediary connecting travelers (Customers) with accommodation providers (Vendors), while the Administrator oversees the entire ecosystem.

**The Workflow:**
The process begins when a **Vendor** registers on the platform and lists their hotel details, including room types, amenities, and pricing. However, to maintain quality and trust, these listings do not go live immediately; an **Admin** must verify and approve the hotel. Once approved, the hotel becomes visible in search results.

**Customers** visit the platform to search for hotels based on location, dates, and preferences. Upon selecting a suitable room, the customer proceeds to book it. The system holds the room for the selected dates and prompts for payment. **Payment processing** is handled securely via an integrated gateway (e.g., Stripe or Razorpay). Once the payment is confirmed, a booking confirmation is sent to both the Customer and the Vendor via email or SMS.

**Revenue Model:**
Staybook utilizes a commission-based revenue model. For every successful booking facilitated through the platform, Staybook retains a percentage of the booking amount as a service fee (commission), transferring the remaining balance to the Vendor. This ensures a sustainable revenue stream for the platform while providing Vendors with a wide customer reach.

---

## 2. Identify User Roles

### **Admin**
The Admin is the superuser of the system with complete control over the platform. Their responsibilities include verifying and approving new vendor registrations and hotel listings to prevent fraudulent activities. They monitor the overall health of the system, manage user accounts (blocking/unblocking if necessary), and oversee financial transactions, including the calculation of platform revenue and vendor payouts.

### **Vendor (Hotel Owner)**
Vendors are business owners who use Staybook to list their properties. A Vendor can manage multiple hotels and rooms. Their dashboard allows them to add new hotels, update room availability, set pricing, and view booking history. They are responsible for fulfilling the service to the customer and can track their daily, weekly, or monthly earnings through the vendor dashboard.

### **Customer**
Customers are the end-users who browse the platform to book accommodations. They can search for hotels, view details and reviews, and make reservations. Customers have a personal dashboard to view their upcoming and past bookings, download invoices, and manage their profile settings. After a stay, they can leave reviews and ratings for the hotel, contributing to the platform's trust system.

### **Employee (Optional/Future)**
This role is designed for hotel staff who need limited access to the system. For example, a receptionist might need access to check-in/check-out features and view daily bookings for a specific hotel without having access to the Vendor's financial data or global settings.

### **Driver (Optional/Future)**
In future expansions involving travel logistics, a Driver role could be integrated. This user would receive pickup/drop-off tasks associated with hotel bookings (e.g., airport transfers) and would update trip statuses in real-time.

---

## 3. Functional Requirements

### **Authentication & Authorization**
The system must provide secure registration and login for all user roles using email and password. JSON Web Tokens (JWT) will be used for session management. Role-Based Access Control (RBAC) is critical to ensure that, for instance, a Customer cannot access the Admin dashboard. Passwords must be hashed (e.g., using bcrypt) before storage.

### **User Management**
Users should be able to update their profiles, including contact information and profile pictures. Admins must have the ability to view a list of all users and manage their account status (active/suspended).

### **Hotel & Room Management**
Vendors need a rich interface to Create, Read, Update, and Delete (CRUD) hotel listings. This includes uploading images, setting locations, defining amenities, and managing room inventory (e.g., defining room types like "Deluxe" or "Suite" and their respective counts and prices).

### **Booking Management**
The core engine of the system. It handles the logic for checking room availability for specific date ranges to prevent double bookings. It manages the lifecycle of a booking from "Pending" to "Confirmed", "Checked-in", "Checked-out", or "Cancelled".

### **Payment Integration**
The system requires a secure payment gateway integration to handle online transactions. It must support generating receipts and tracking transaction statuses (Success/Failure). Refund logic should also be defined for cancellations based on the cancellation policy.

### **Admin Dashboard**
A centralized hub for the Admin to view key metrics: Total Users, Total Active Hotels, Total Bookings, and Total Revenue. It should include data visualization (charts/graphs) for better insights.

### **Notifications**
An automated notification system to keep users informed. Emails or SMS should be triggered for events like Registration Welcome, Booking Confirmation, Payment Receipt, and Booking Cancellation.

---

## 4. Non-Functional Requirements

### **Security**
Data privacy is paramount. All sensitive data communication must occur over HTTPS. User inputs must be sanitized to prevent SQL Injection and XSS attacks. API rate limiting should be implemented to prevent DDoS attacks.

### **Performance**
The application should load quickly. APIs must respond within 200ms for a smooth user experience. Database queries should be indexed and optimized. Static assets (images) should be compressed or served via a CDN.

### **Scalability**
The architecture should support horizontal scaling. As the user base grows, the system should be able to handle increased traffic without downtime, potentially by load balancing across multiple server instances.

### **Availability**
The system aims for high availability (99.9% uptime). Error handling mechanisms should be robust to prevent the entire server from crashing due to a single unhandled exception.

### **Responsiveness**
The Frontend must be fully responsive and mobile-friendly, ensuring a seamless experience across desktops, tablets, and smartphones.

---

## 5. High-Level Architecture Design

### **Architecture Options**

**Option 1: Monolithic Architecture**
In a monolith, all modules (User, Hotel, Booking, Payment) are tightly coupled in a single codebase and deployed as a single unit. It shares a single database.
*   *Pros:* Easier to develop, test, and deploy for smaller teams; lower operational complexity.
*   *Cons:* Harder to scale individual components; a failure in one module can bring down the whole system.

**Option 2: Microservices Architecture**
The application is broken down into small, independent services (e.g., AuthService, BookingService, PaymentService), each running in its own process and communicating via APIs.
*   *Pros:* Highly scalable; allows different technology stacks per service; fault isolation.
*   *Cons:* Complex to manage; requires sophisticated DevOps and orchestration (Docker/Kubernetes).

### **Recommendation**
For this project (Staybook), **Monolithic Architecture** is recommended initially. It reduces the overhead of managing distributed systems, allowing the focus to remain on feature implementation and business logic. As the application grows significantly in traffic, it can be refactored into Microservices.

### **System Flow**
1.  **Client (Frontend)**: React.js application sends HTTP requests.
2.  **API Gateway / Server**: Node.js/Express server receives requests.
3.  **Middleware**: Validates Auth Token (JWT) and User Role.
4.  **Controller**: Handles the request logic.
5.  **Service Layer**: Executes business rules (e.g., checking room availability).
6.  **Database**: MongoDB operations are performed.
7.  **Payment Gateway**: External communication for transaction processing.
8.  **Response**: JSON data is sent back to the Client.

---

## 6. Basic ER Diagram (Conceptual)

### **Entities**
*   **User**: `_id`, `name`, `email`, `password`, `role`, `phone`, `createdAt`
*   **Hotel**: `_id`, `vendorId`, `name`, `address`, `city`, `images`, `amenities`, `approved`, `rating`
*   **Room**: `_id`, `hotelId`, `type`, `price`, `capacity`, `count`, `images`
*   **Booking**: `_id`, `userId`, `hotelId`, `roomId`, `checkIn`, `checkOut`, `totalAmount`, `status`, `paymentId`
*   **Review**: `_id`, `userId`, `hotelId`, `rating`, `comment`

### **Relationships**
*   **One User (Vendor) → Many Hotels**: A vendor can own multiple properties.
*   **One Hotel → Many Rooms**: A hotel consists of multiple room types.
*   **One User (Customer) → Many Bookings**: A customer can make multiple reservations over time.
*   **One Room → Many Bookings**: A generic room type is linked to multiple booking records (availability is calculated based on dates).
*   **One Hotel → Many Reviews**: A hotel accumulates reviews from different users.
*   **One Booking → One Payment**: Each booking is associated with a specific transaction record.

---

## 7. Core Modules Definition

### **Authentication Module**
Handles all security-related entry points. Includes `Register`, `Login`, `Logout`, and `ForgotPassword` functionalities. Responsible for issuing and verifying JWTs.

### **User Module**
Manages user profile data. Allows users to view and edit their personal information.

### **Vendor Module**
The workspace for hotel owners. Functions include `AddHotel`, `EditHotel`, `DeleteHotel`, `AddRoom`, and `ViewMyBookings`.

### **Booking Module**
Manages the reservation workflow. Functions include `SearchHotels`, `CheckAvailability`, `CreateBooking`, `CancelBooking`, and `GetBookingDetails`.

### **Admin Module**
System-wide management. Functions include `ApproveHotel`, `BlockUser`, `ViewAllStats`.

### **Payment Module**
Handles the financial transactions. Integration with payment providers to `ProcessPayment` and updates booking status upon success.
