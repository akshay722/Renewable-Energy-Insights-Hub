import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
        Your Profile
      </h1>

      {/* Profile information card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
            <div className="h-24 w-24 rounded-full bg-primary text-white text-4xl flex items-center justify-center">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
              Account Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                  Username
                </p>
                <p className="text-base" style={{ color: 'var(--color-text)' }}>
                  {user?.username}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                  Email
                </p>
                <p className="text-base" style={{ color: 'var(--color-text)' }}>
                  {user?.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                  Account Status
                </p>
                <div className="flex items-center">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full mr-2"
                    style={{ 
                      backgroundColor: user?.is_active
                        ? isDark ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)'
                        : isDark ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)'
                    }}
                  ></span>
                  <p className="text-base" style={{ color: 'var(--color-text)' }}>
                    {user?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-light)' }}>
                  Account Type
                </p>
                <p className="text-base" style={{ color: 'var(--color-text)' }}>
                  {user?.is_admin ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account actions card */}
      <div className="card" style={{ backgroundColor: 'var(--color-background-dark)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Account Actions
        </h2>

        <button
          className="btn w-full sm:w-auto"
          style={{ 
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(254, 226, 226, 0.8)',
            color: isDark ? 'rgba(252, 165, 165, 0.9)' : 'rgba(185, 28, 28, 1)'
          }}
          onClick={logout}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
