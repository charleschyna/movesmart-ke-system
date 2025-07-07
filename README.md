# MoveSmart KE – Kenya's AI-Powered Urban Traffic Intelligence App

## 🧭 Overview
MoveSmart KE is a web-based platform built to solve Kenya's growing urban traffic challenges using real-time data, crowdsourced insights, and AI-driven analytics. The app provides commuters, city planners, and transport companies with a dynamic, data-rich dashboard to monitor, predict, and optimize movement across major Kenyan cities.

## 🏙️ Supported Cities
- Nairobi (Default)
- Mombasa
- Kisumu
- Nakuru
- Eldoret

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/movesmart-ke.git
cd movesmart-ke

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the application
npm run dev  # Frontend
python manage.py runserver  # Backend
```

## 🏗️ Project Structure
```
movesmart-ke/
├── frontend/           # React frontend application
├── backend/           # Django/FastAPI backend
├── ai-models/         # ML models and training scripts
├── docs/             # Documentation
├── docker-compose.yml # Docker configuration
└── README.md         # This file
```

## 🛠️ Tech Stack
- **Frontend**: React, TailwindCSS, Framer Motion
- **Backend**: Django/FastAPI, PostgreSQL
- **AI/ML**: Python, scikit-learn, TensorFlow, FastAPI
- **Maps**: TOMTOM API
- **Notifications**: Firebase Cloud Messaging

## 📱 Key Features
- Real-time traffic monitoring
- AI-powered route optimization
- Predictive analytics
- Scenario simulation
- Incident reporting
- Sustainability insights
- Smart notifications

## 🤝 Contributing
Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) before submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team
Built with ❤️ for Kenya's urban mobility challenges.
