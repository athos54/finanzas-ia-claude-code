import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    // Procesar callback de OAuth primero
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const error = urlParams.get("error");


    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      // Limpiar los parámetros de la URL
      window.history.replaceState({}, document.title, window.location.pathname);

      navigate("/dashboard", { replace: true });
      return;
    }

    if (error) {
      setError(decodeURIComponent(error));
      // Limpiar parámetros de error de la URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Verificar si ya está logueado (solo si no hay parámetros OAuth)
    if (!token && !user && !error) {
      const existingToken = localStorage.getItem("token");
      const existingUser = localStorage.getItem("user");


      if (existingToken && existingUser) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location.search, navigate]);

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const googleAuthUrl = `${apiUrl}/auth/google`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-pink-600/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 space-y-8">
          <div className="text-center">
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-2xl">💰</span>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Iniciar Sesión
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Gestiona tus ingresos y gastos de forma sencilla
            </p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="group relative w-full flex justify-center items-center py-4 px-6 bg-white border-2 border-gray-200 text-lg font-medium rounded-2xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continuar con Google</span>
              <svg
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Security note */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Tu información está segura y protegida
            </p>
          </div>
        </div>

        {/* Additional info */}
        <div className="text-center">
          <p className="text-gray-600">
            ¿Primera vez aquí? No te preocupes, se creará tu cuenta
            automáticamente
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
