# 📚 Library Management System API

## 📌 Project Overview
This is a **backend system for a library**, built using **Node.js, Express.js, and MongoDB**. It allows users to **add, search, borrow, and return books** while managing user accounts with authentication.

✅ **Meets all assignment requirements**, including:  
- API endpoints for **book management & borrowing system**  
- **User authentication with JWT tokens**  
- **Validation, error handling, and security measures**  
- **Well-structured code and proper documentation**  

---

## 🚀 Technologies Used
- **Node.js** – Server-side JavaScript runtime  
- **Express.js** – Web framework  
- **MongoDB** – Database for storing books & users  
- **Mongoose** – ORM for MongoDB  
- **JWT (jsonwebtoken)** – Authentication  
- **bcrypt** – Secure password hashing  
- **dotenv** – Environment variable management  

---

## 📌 Installation & Setup

### 1️⃣ Clone the Repository  
```sh
git clone <repository_url>
cd library-management
```

### 2️⃣ Install Dependencies  
```sh
npm install
```

### 3️⃣ Configure Environment Variables  
Create a `.env` file in the project root and add the following:  
```env
PORT=5000  # The port where the server runs
MONGODB_URI=mongodb+srv://<your_mongo_uri>  # Replace with your MongoDB connection string
NODE_ENV=development  # Environment mode (development/production)
JWT_SECRET=<your_secret_key>  # Used to sign JWT tokens, replace with a strong random string
```
**Important Notes:**  
- **Replace `<your_mongo_uri>`** with your actual **MongoDB connection string**.  
- **Replace `<your_secret_key>`** with a **secure random string** (use `crypto.randomBytes(32).toString('hex')` in Node.js to generate one).  
- Never hardcode database credentials in the source code. Always use `.env`.  

### 4️⃣ Start the Server  
```sh
npm run dev  # Runs with nodemon (for development)
```

---

## 📌 API Documentation

### **1️⃣ User Authentication**
#### 🔹 **Register a User** _(Stores user data in MongoDB)_  
**POST /api/users**  
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword"
}
```

#### 🔹 **Login a User** _(Returns JWT token)_  
**POST /api/users/login**  
```json
{
  "email": "test@example.com",
  "password": "securepassword"
}
```
Response:  
```json
{
  "token": "your_jwt_token"
}
```

---

### **2️⃣ Books Management** _(Allows adding, retrieving books)_  
#### 🔹 **Add a Book** _(Requires authentication)_  
**POST /api/books**  
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "ISBN": "1234567890",
  "quantity": 5
}
```

#### 🔹 **Get All Books**  
**GET /api/books**  

#### 🔹 **Get a Specific Book**  
**GET /api/books/:id**  

---

### **3️⃣ Borrowing & Returning Books** _(Manages borrowing and returning books)_  
#### 🔹 **Borrow a Book** _(Requires Authentication)_  
**POST /api/borrow/:bookId**  
Headers:  
```
Authorization: Bearer <JWT_TOKEN>
```

#### 🔹 **Return a Book** _(Requires Authentication)_  
**POST /api/return/:bookId**  
Headers:  
```
Authorization: Bearer <JWT_TOKEN>
```

#### 🔹 **Get Borrowed Books of a User**  
**GET /api/users/:userId/books**  

---

## 📌 Validation & Security Measures
✅ **Proper input validation implemented** (ensures all required fields are provided).  
✅ **JWT-based authentication used** (ensures secure access to protected routes).  
✅ **Password hashing with bcrypt** (ensures secure storage of user credentials).  
✅ **MongoDB security measures implemented** (ensures no unauthorized access).  
✅ **Error handling added for validation failures & database errors**.  

---
