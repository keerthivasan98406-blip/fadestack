# FADESTACK - Full Stack Developer Portfolio

A premium, aesthetic website for a full stack developer with 3D animations and complete authentication system.

## 🌟 Features

- **Premium Design**: Gold/copper/lavender gradient color scheme with glassmorphism effects
- **3D Animations**: Three.js particle background and rotating cube logo
- **Custom Cursor**: Animated cursor with hover effects
- **Complete Authentication**: Login, Registration, Forgot Password
- **Backend Integration**: Node.js/Express with MongoDB database
- **JWT Security**: Secure token-based authentication
- **Responsive Design**: Works on all devices

## 📁 Project Structure

```
fadestack-website/
├── index.html          # Main website
├── login.html          # Login/Register page
├── styles.css          # Main website styles
├── login.css           # Login page styles
├── script.js           # Main website JavaScript
├── login.js            # Login page JavaScript
├── server.js           # Node.js backend server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Install Node.js
Download and install Node.js from [nodejs.org](https://nodejs.org/) (version 14 or higher recommended).

### 2. Install MongoDB
Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud).

### 3. Clone and Setup
```bash
# Navigate to project folder
cd fadestack-website

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 4. Configure Environment
Edit `.env` file with your settings:
```env
MONGODB_URI=mongodb://localhost:27017/fadestack
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 5. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

### 6. Open in Browser
Visit: `http://localhost:3000`

## 🔐 Authentication API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset |
| GET | `/api/auth/verify` | Verify JWT token |

### Register Request
```json
POST /api/auth/register
{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
}
```

### Login Request
```json
POST /api/auth/login
{
    "identifier": "john@example.com",
    "password": "password123"
}
```

## 🛠️ Technologies Used

**Frontend:**
- HTML5, CSS3, JavaScript
- Three.js (3D graphics)
- Custom cursor effects
- Glassmorphism design

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fadestack` |
| `JWT_SECRET` | Secret key for JWT tokens | `fadestack-secret-key-2024` |
| `PORT` | Server port | `3000` |

## 🎨 Design Features

- **Color Palette**: Gold (#d4af37), Copper (#c9a86c), Lavender (#b4a0ff)
- **Typography**: Playfair Display (headings), Inter (body)
- **Animations**: Smooth transitions, 3D cube rotation, particle effects
- **UI Elements**: Glassmorphism cards, floating inputs, toast notifications

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS configuration
- Secure HTTP headers

## 📄 License

MIT License - Feel free to use this project for your own portfolio!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please reach out to hello@fadestack.com
