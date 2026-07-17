# 🏠 EstateX - Real Estate Discovery Platform

A modern, full-stack real estate application designed to simplify property search for both rentals and purchases. Built with cutting-edge web technologies for seamless user experience.

## ✨ Key Features

- 🔍 **Advanced Property Search** - Filter by location, price, amenities, and more
- 🗺️ **Interactive Map Integration** - Google Maps API for visual property exploration
- 💰 **Dual Marketplace** - Browse rental listings and purchase opportunities
- 🔐 **Secure Authentication** - JWT-based user authentication with encrypted passwords
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live property listings powered by Express backend
- 🎨 **Modern UI** - Built with React + Tailwind CSS for beautiful interfaces
- 🤖 **AI-Powered Insights** - Google Gemini integration for property recommendations

## 🛠️ Tech Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4.1 (utility-first styling)
- Vite (lightning-fast development & builds)
- Google Maps React component
- Lucide React (icon library)
- Motion (smooth animations)

**Backend:**
- Express.js (Node.js server)
- TypeScript for type safety
- JWT authentication
- Bcryptjs for password hashing
- Google Gemini AI API

**Deployment:**
- Google Cloud Run
- Live at: https://remix-estatex-934756712714.asia-southeast1.run.app

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/deyjaydeep40-arch/EstateX.git
cd EstateX

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# - Google Maps API Key
# - Google Gemini API Key
# - JWT Secret
```

### Development

```bash
# Start development server (with hot reload)
npm run dev

# Run TypeScript linting
npm run lint
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Clean build artifacts
npm run clean
```

## 📁 Project Structure

```
EstateX/
├── src/                 # React components & pages
├── server.ts           # Express backend server
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── index.html          # HTML entry point
├── metadata.json       # App metadata
└── assets/             # Static images & resources
```

## 🔑 Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_GOOGLE_GEMINI_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
PORT=5173
```

## 📊 Core Features Explained

### Property Search
- Filter properties by price range, location, property type
- Sort by relevance, price, newest listings
- View detailed property information and high-resolution images

### User Authentication
- Secure signup/login system
- JWT token-based sessions
- Password encryption with Bcryptjs
- Protected routes for authenticated users

### Map Integration
- Visualize properties on interactive Google Map
- Cluster nearby properties
- Click to view property details
- Search by drawing on map (coming soon)

### AI Recommendations
- Personalized property suggestions based on preferences
- Market analysis and trends
- Price predictions (coming soon)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 💡 Roadmap

- [ ] Advanced property filters (school district, crime rate, etc.)
- [ ] Virtual property tours (VR/360° images)
- [ ] Mortgage calculator
- [ ] Neighborhood comparison tool
- [ ] Price prediction ML model
- [ ] User favorites & saved searches
- [ ] Agent/broker dashboard

## 📧 Contact & Support

Have questions or found a bug? Open an issue on GitHub or reach out!

---

**Built with ❤️ for real estate enthusiasts**