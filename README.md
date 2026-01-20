# VitaLITy - Frontend

A visual analytics tool for promoting serendipitous discovery of academic literature using Transformers.

---

## 📋 Table of Contents
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development](#-development)
- [Production Build](#-production-build)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Credits](#credits)

---

## 🔧 Prerequisites

| Requirement | Minimum Version | Tested/Recommended |
|-------------|----------------|-------------------|
| Node.js | v14.8.0+ | v25.1.0 |
| npm | 6.14.7+ | 11.6.2 |
| yarn | 1.22+ | 1.22+ (recommended) |

**Note:** The project works with both legacy (v14.8.0) and modern Node.js versions (v25+).

**Required:** The [rest-api](https://github.com/vitality-vis/rest-api) backend must be running for full functionality.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/vitality-vis/frontend.git
cd frontend

# Install dependencies
yarn install
# or
npm install
```

---

## 🚀 Development

### Quick Start

```bash
# Make sure the backend API is running first (see rest-api repo)

# Start the development server
yarn start-dev

# Open in your browser
# http://localhost:8080/vitality2/
```

That's it! The app will automatically reload when you make changes.

### Backend Connection

The frontend expects the backend API to be running on `http://localhost:3000`. 

Make sure to start the [rest-api](https://github.com/vitality-vis/rest-api) backend before running the frontend.

---

## 🏗️ Building for Production

To compile TypeScript to JavaScript and create a production-ready bundle:

```bash
# Build for production
yarn build
```

**Build output:**
```
dist/
├── index.html
├── js/
│   └── bundle.[hash].min.js    # Compiled & minified JavaScript
└── img/                         # Static assets
```

The `dist/` folder is ready to be served at `/vitality2/` on any static web server (nginx, Apache, etc.).

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/       # Core UI components (App, SmartTable, PaperScatter, etc.)
│   ├── socket/           # WebSocket connection
│   ├── utils/            # Utility functions & configs
│   ├── hooks/            # React hooks
│   ├── styles/           # SCSS stylesheets
│   ├── assets/           # Static assets (images, icons)
│   ├── config.ts         # API configuration
│   └── index.tsx         # Application entry point
├── configs/webpack/      # Webpack configurations
├── tests/                # Test files
└── package.json
```

---

## 🧪 Testing

```bash
yarn test
```

---

### Credits
vitaLITy was created by 
<a target="_blank" href="https://narechania.com">Arpit Narechania</a>, <a target="_blank" href="https://www.karduni.com/">Alireza Karduni</a>, <a target="_blank" href="https://wesslen.netlify.app/">Ryan Wesslen</a>, and <a target="_blank" href="https://emilywall.github.io/">Emily Wall</a>.


### Citation
```bibTeX
@article{narechania2021vitality,
  title={vitaLITy: Promoting Serendipitous Discovery of Academic Literature with Transformers \& Visual Analytics},
  author={Narechania, Arpit and Karduni, Alireza and Wesslen, Ryan and Wall, Emily},
  journal={IEEE Transactions on Visualization and Computer Graphics},
  year={2021},
  doi={10.1109/TVCG.2021.3114820},
  publisher={IEEE}
}
```

### License
The software is available under the [MIT License](https://github.com/vitality-vis/frontend/blob/master/LICENSE).


### Contact
If you have any questions, feel free to [open an issue](https://github.com/vitality-vis/frontend/issues/new/choose) or contact [Arpit Narechania](https://narechania.com).
