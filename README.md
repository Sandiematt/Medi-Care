<div align="center">
  
# 🏥 Medi-Care
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CODE_OF_CONDUCT.md)
### Modern Healthcare Management at Your Fingertips 📱
</div>

## ✨ Features
🏛️ **Core Functionalities**
- 📊 Interactive Health Dashboard
- 💊 Medication Tracking & Reminders
- 📋 Digital Medical Records
- 🎥 Finding Nearby Hospitals
- ⚡ Real-time Health Monitoring
- 🔍 **Fake Medicine Detection using CNN/YOLO** - Verify pill authenticity with ML

## 🚀 Getting Started
### Prerequisites
Before you begin, ensure you have the following installed:
- 📦 Node.js (v16 or newer)
- 🔧 npm or Yarn
- 🛠️ React Native CLI
- 🍎 For iOS:
  - Xcode
  - CocoaPods
- 🤖 For Android:
  - Android Studio
  - JDK

### 🔨 Installation
1️⃣ **Clone the repository**
```bash
git clone https://github.com/your-username/medi-care.git
cd medi-care
```

2️⃣ **Install dependencies**
```bash
# Using npm
npm install
# OR using Yarn
yarn install
```

3️⃣ **iOS Setup** (iOS only)
```bash
cd ios
pod install
cd ..
```

## 🎯 Running the App
### 🚦 Start Metro Server
```bash
# Using npm
npm start
# OR using Yarn
yarn start
```

### 📱 Launch the App
**Android:**
```bash
# Using npm
npm run android
# OR using Yarn
yarn android
```

## 🏗️ Project Structure
```
medi-care/
├── 📱 src/
│   ├── 🧩 components/
│   │   ├── common/
│   │   ├── forms/
│   │   └── screens/
│   ├── 📄 screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── medicineDetection/  # New module for pill verification
│   │   └── profile/
│   ├── 🧭 navigation/
│   ├── 🔧 services/
│   │   └── medicineDetectionService.ts  # YOLO model service
│   ├── 🛠️ utils/
│   └── 🎨 assets/
│       └── models/  # Contains trained YOLO models
├── 📱 ios/
├── 🤖 android/
└── 📘 README.md
```

## 🧠 ML-Powered Medicine Verification
The app uses a custom-trained YOLO (You Only Look Once) model to detect counterfeit medications:

- 📸 Capture pill images directly through the app
- 🔄 Real-time analysis with on-device inference
- ✅ Verification of pill authenticity
- ℹ️ Detailed information about detected medication
- ⚠️ Warning flags for suspicious characteristics

### Model Details
- Architecture: YOLOv5 CNN
- Training Dataset: 100+ images of authentic and counterfeit medications
- Accuracy: ~95% in controlled environments
- Inference Speed: ~300ms on mid-range devices

## 🔄 State Management
The app uses a combination of:
- React Context for theme/auth
- Local state for component-specific data

## 🎨 UI Components
Built with:
- React Native Paper
- Custom components
- Native animations
- Responsive layouts

## 🛠️ Development
### Running Tests
```bash
# Unit tests
npm run test
# E2E tests
npm run e2e
```

## 🐛 Troubleshooting
### Common Issues
#### 🔴 Android Build Issues
```bash
cd android
./gradlew clean
```

#### 🔴 Metro Bundler Issues
```bash
npm start -- --reset-cache
```

#### 🔴 TensorFlow.js Model Loading Issues
```bash
# Clear TensorFlow cache
rm -rf ~/.tfjs-models
# Reinstall TensorFlow dependencies
npm install @tensorflow/tfjs @tensorflow/tfjs-react-native
```

## 🤝 Contributing
1. 🍴 Fork the repository
2. 🌱 Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. 💻 Code your changes
4. 📝 Commit changes (`git commit -m 'Add AmazingFeature'`)
5. 🚀 Push to branch (`git push origin feature/AmazingFeature`)
6. 🔍 Open a Pull Request

## 📘 Learn More
- [React Native](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [YOLOv5](https://github.com/ultralytics/yolov5)

## 📬 Contact
Sandeep Mathew - [@Sandeepmathew15](https://x.com/SandeepMathew15)
Project Link: (https://github.com/Sandiematt/medi-care)

---
<div align="center">
Made with ❤️ by Sandeep Mathew & Greeshma Girish C
⭐️ Star us on GitHub — it helps!
</div>
