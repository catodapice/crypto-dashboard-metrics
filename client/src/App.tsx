import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

// Páginas
import Dashboard from "./pages/Dashboard";
import TradeAnalysis from "./pages/TradeAnalysis";
// import Login from "./pages/Login";
// import Register from "./pages/Register";

// Componentes
import Layout from "./components/layout/Layout";

// Contexto de autenticación
// import { AuthProvider, useAuth } from "./context/AuthContext";

// Tema personalizado
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
    background: {
      default: "#121212",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Componente para rutas protegidas - Comentado temporalmente
// const ProtectedRoute = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" />;
//   }

//   return children;
// };

const App: React.FC = () => {
  const [environment, setEnvironment] = useState<string>("");

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/env-check");
        setEnvironment(response.data.environment);
      } catch (error) {
        console.error("Error checking environment:", error);
      }
    };

    checkEnvironment();
  }, []);

  return (
    // <AuthProvider>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> */}
            <Route
              path="/"
              element={
                // <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
                // </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                // <ProtectedRoute>
                <Layout>
                  <TradeAnalysis />
                </Layout>
                // </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        {environment && (
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              padding: "5px 10px",
              background: environment === "PRODUCTION" ? "#ff4d4f" : "#52c41a",
              color: "white",
              fontWeight: "bold",
              zIndex: 1000,
            }}
          >
            {environment}
          </div>
        )}
      </LocalizationProvider>
    </ThemeProvider>
    // </AuthProvider>
  );
};

export default App;
