# MongoDB Schema Design

## Collections

### 1. Users
| Field | Type | Description |
|---|---|---|
| _id | ObjectId | Unique identifier |
| name | String | Full name |
| email | String | Unique email address |
| password | String | Hashed password |
| role | String | 'customer', 'vendor', 'admin' |
| createdAt | Date | Timestamp |

### 2. Vendors (Profile Extension)
| Field | Type | Description |
|---|---|---|
| userId | ObjectId | Reference to User |
| storeName | String | Business name |
| address | String | Business address |
| taxId | String | Tax identification number |
| isVerified | Boolean | Admin approval status |

### 3. Hotels
| Field | Type | Description |
|---|---|---|
| vendorId | ObjectId | Reference to User (Vendor) |
| name | String | Hotel name |
| location | String | Address/City |
| description | String | Hotel details |
| amenities | Array<String> | List of amenities |
| imageUrls | Array<String> | List of image URLs |

### 4. Rooms
| Field | Type | Description |
|---|---|---|
| hotelId | ObjectId | Reference to Hotel |
| roomType | String | 'Single', 'Double', 'Suite' |
| pricePerNight | Number | Cost per night |
| count | Number | Total rooms of this type |
| isAvailable | Boolean | Availability status |

### 5. Bookings
| Field | Type | Description |
|---|---|---|
| userId | ObjectId | Reference to User (Customer) |
| hotelId | ObjectId | Reference to Hotel |
| roomId | ObjectId | Reference to Room |
| checkInDate | Date | Start date |
| checkOutDate | Date | End date |
| totalPrice | Number | Calculated cost |
| status | String | 'confirmed', 'cancelled', 'completed' |

### 6. Payments
| Field | Type | Description |
|---|---|---|
| bookingId | ObjectId | Reference to Booking |
| amount | Number | Payment amount |
| method | String | 'card', 'upi', 'cash' |
| status | String | 'pending', 'completed' |
| transactionId | String | Gateway transaction ID |

### 7. StatusLogs
| Field | Type | Description |
|---|---|---|
| bookingId | ObjectId | Reference to Booking |
| previousStatus | String | Old status |
| newStatus | String | New status |
| updatedBy | ObjectId | Reference to User |
| reason | String | Optional reason |
