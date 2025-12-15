# Lingua Talk 🗣️

**Talk. Be Heard** - An AI-powered IELTS Speaking practice app built with React Native (Expo) and Supabase.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Python** (3.8+) - for backend

### Installation & Setup

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/nguyenchiminhhieu/btl_app.git
cd btl_app
```

#### 2️⃣ Setup Frontend Environment
```bash
# Install frontend dependencies
npm install

# Create .env file from template
cp .env.example .env
```

**Edit `.env` file and add your API keys:**
```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=southeastasia
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key_here
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP:3000
```

**Get your IP address:**
- **Windows:** `ipconfig` → Look for "IPv4 Address"
- **Mac/Linux:** `ifconfig` → Look for "inet" address

#### 3️⃣ Setup Backend Environment
```bash
cd backend

# Install backend dependencies
npm install

# Create .env file from template
cp .env.example .env
```

**Edit `backend/.env` and add your API keys:**
```env
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=southeastasia
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key_here
PORT=3000
FRONTEND_URL=http://localhost:19000
```

#### 4️⃣ Start the Backend Server
```bash
cd backend
npm start
```

✅ Backend should be running at `http://YOUR_IP:3000`

#### 5️⃣ Start the Expo Frontend (New Terminal/Tab)
```bash
# Go back to project root
cd ..

# Start Expo
npm start
```

Then choose:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web browser
- Scan QR code with Expo Go app (mobile device)

---

### 🔑 Getting API Keys

#### Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy URL and Anon Key from Settings → API

#### Azure Speech Service
1. Go to [Azure Portal](https://portal.azure.com)
2. Create "Speech" resource
3. Get Key and Region from Keys and Endpoint

#### OpenAI API
1. Go to [openai.com/api](https://platform.openai.com/api-keys)
2. Create new API key
3. Copy and paste in `.env`

#### Google Speech API
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Speech-to-Text API
3. Create API key

---

### ⚠️ Important Notes

- ❌ **Never commit `.env` files** - they contain sensitive keys
- ✅ **Only commit `.env.example`** files
- Each developer should have their own `.env` files
- Backend must be running before starting Expo app

## 📁 Project Structure

```plaintext
lingua-talk/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── _layout.tsx        # Root layout
├── backend/               # Node.js backend
│   └── src/              # Backend source code
├── components/            # Reusable React components
│   ├── auth/             # Authentication components
│   ├── speaking/         # Speaking practice components
│   └── ui/               # UI components
├── constants/            # Theme and constants
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── services/             # API services & Supabase
├── supabase/             # Supabase functions
└── assets/               # Images and static assets
```

## 🎨 Features

- ✅ IELTS Speaking Part 1 practice with AI assessment
- ✅ Real-time pronunciation, fluency, grammar scoring
- ✅ User authentication with Supabase
- ✅ Modern UI with Navy Blue (#202254) theme
- 🚧 Parts 2 & 3 (Coming soon)

## 🛠️ Tech Stack

- **Frontend:** React Native (Expo SDK 54), TypeScript
- **Backend:** Node.js, Express, Python
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4, Azure Speech SDK
- **UI:** expo-linear-gradient, @expo/vector-icons
