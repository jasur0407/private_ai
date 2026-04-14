## Prerequisites

Make sure you have the following:

- Node.js v18+
- Python 3.9+
- Groq API key
---
You can get a free Groq API key from `https://console.groq.com/keys`

- Click `Create API Key`
- Give it a name
- Copy the API key

## Get started

### 1. Clone the repository

```bash
git clone https://github.com/jasur0407/private_ai
cd private_ai
```

### 2. Backend setup

Navigate to the backend folder

```bash
cd backend
```

#### Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Create .env file
In the root of the project (`./backend`), create a file called `.env`:

```env
GROQ_API_KEY=place_your_copied_API_key
```
> Don't commit or share your `.env` file with an API key publicly

#### Start the backend server in terminal

```bash
uvicorn main:app --reload
```

The API will be live at `http://localhost:8000`. 
You can see it running by opening `http://localhost:8000/docs` in your browser

> Do not close terminal running the server

### 3. Frontend setup

Navigate to the frontend folder in a separate terminal:

```bash
cd frontend
```

#### Install Node dependencies

```bash
npm install
```

#### Start the dev server

```bash
npm run dev
```

Go to `http://localhost:5173` to see it running and use the application

> Backend should also be running in another terminal