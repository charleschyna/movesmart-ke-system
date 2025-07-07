# Getting Started with MoveSmart KE

## 🚀 Quick Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- PostgreSQL (for production)
- Git

### 1. Clone and Setup Frontend

```bash
cd movesmart-ke/frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

### 2. Setup Backend (Optional for basic demo)

```bash
cd movesmart-ke/backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### 3. Using Docker (Full Stack)

```bash
# From the root directory
docker-compose up --build
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 🧪 Demo Mode

The application is set up to work in demo mode with mock data. You can:

1. **Login**: Use any email and password to access the dashboard
2. **Dashboard**: View real-time traffic statistics for Kenyan cities
3. **City Switching**: Switch between Nairobi, Mombasa, Kisumu, Nakuru, and Eldoret
4. **Mock Data**: All traffic data and incidents are simulated for demo purposes

## 🏗️ Project Structure

```
movesmart-ke/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── dashboard/   # Dashboard components
│   │   │   └── shared/      # Shared/reusable components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── constants/      # App constants and configuration
│   │   ├── services/       # API services
│   │   └── index.css       # TailwindCSS styles
│   ├── public/             # Static assets
│   └── package.json        # Dependencies
├── backend/                 # Django/FastAPI backend
│   ├── manage.py           # Django management script
│   ├── movesmart_backend/  # Main Django project
│   └── requirements.txt    # Python dependencies
├── ai-models/              # ML models and training scripts
├── docs/                   # Documentation
├── docker-compose.yml      # Docker configuration
└── README.md              # Main project README
```

## 🔧 Development Features

### Currently Implemented:
- ✅ User authentication (demo mode)
- ✅ City switching (5 Kenyan cities)
- ✅ Dashboard with traffic statistics
- ✅ Responsive design with TailwindCSS
- ✅ Mock API services
- ✅ Real-time data simulation
- ✅ Incident reporting system (UI)
- ✅ AI insights display

### Next Steps for Full Implementation:
- 🔄 Complete backend API endpoints
- 🔄 Real traffic data integration
- 🔄 Map integration (TomTom )
- 🔄 Route optimization algorithms
- 🔄 Predictive analytics with ML models
- 🔄 Notification system
- 🔄 Admin panel
- 🔄 Mobile responsive enhancements

## 🎨 Design System

The app uses a custom design system built on TailwindCSS:

- **Colors**: Primary blue theme with Kenya flag colors
- **Typography**: Inter font family
- **Components**: Consistent card layouts, buttons, and forms
- **Animations**: Framer Motion for smooth interactions

## 🚗 Kenya-Specific Features

- **Cities**: Nairobi, Mombasa, Kisumu, Nakuru, Eldoret
- **Local Context**: Designed for Kenyan traffic patterns
- **Currency**: Kenya Shilling (KES) ready
- **Time Zones**: East Africa Time (EAT)

## 🔮 AI Features (Planned)

- **Traffic Prediction**: ML models for congestion forecasting
- **Route Optimization**: AI-powered pathfinding
- **Incident Detection**: Automated incident classification
- **Sustainability Insights**: Environmental impact tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when applicable)
5. Submit a pull request

## 📱 Mobile Support

The app is designed mobile-first and works well on:
- Desktop browsers
- Tablets
- Mobile phones (iOS/Android)

## 🛠️ Troubleshooting

### Common Issues:

1. **Port conflicts**: Ensure ports 3000 and 8000 are available
2. **Node version**: Use Node.js v16 or higher
3. **Package conflicts**: Clear node_modules and reinstall if needed

### Support:
- Email: charleschainamwangi@gmail.com
- Documentation: /docs folder
- Issues: GitHub Issues tab

---

Happy coding! 🚗💨
