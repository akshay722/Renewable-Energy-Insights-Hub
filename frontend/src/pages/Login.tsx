import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/LoadingScreen";

const Login = () => {
  const { login, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(username, password);
      setIsLoginSuccess(true);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setIsSubmitting(false);
    }
  };

  // Show loading screen after successful login
  if (isLoginSuccess) {
    return <LoadingScreen message="Welcome back! Loading your dashboard..." />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div
        className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: "var(--color-card-bg)" }}
      >
        <div className="text-center">
          <img
            src="/renewable.png"
            className="h-12 w-12 mx-auto text-primary"
            alt="Renewable Energy Insights Hub Logo"
          />
          <h2
            className="mt-4 text-3xl font-extrabold"
            style={{ color: "var(--color-text)" }}
          >
            Sign in to your account
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ color: "var(--color-text-light)" }}
          >
            Or{" "}
            <Link
              to="/register"
              className="font-medium hover:text-primary-dark"
              style={{ color: "var(--color-primary)" }}
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div
              className="p-3 rounded-md text-sm cursor-pointer"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--color-error)",
              }}
              onClick={clearError}
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="form-label">
                Email or Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter your email or username"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary flex justify-center py-3"
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        {/* Demo account info */}
        <div
          className="mt-4 text-center text-sm border-t pt-4"
          style={{ color: "var(--color-text-light)" }}
        >
          <p>Demo Account:</p>
          <p>Email: demo@example.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
