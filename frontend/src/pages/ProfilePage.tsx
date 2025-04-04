import { useAuth } from "../context/AuthContext";
// import { mockDataApi } from "../services/api";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>

      {/* Profile information card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
            <div className="h-24 w-24 rounded-full bg-primary text-white text-4xl flex items-center justify-center">
              {user?.username.charAt(0).toUpperCase()}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Username</p>
                <p className="text-base text-gray-900">{user?.username}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base text-gray-900">{user?.email}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Status
                </p>
                <div className="flex items-center">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      user?.is_active ? "bg-green-500" : "bg-red-500"
                    } mr-2`}
                  ></span>
                  <p className="text-base text-gray-900">
                    {user?.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Type
                </p>
                <p className="text-base text-gray-900">
                  {user?.is_admin ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account actions card */}
      <div className="card bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Account Actions
        </h2>

        <div className="space-y-4">
          <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full sm:w-auto">
            Change Password
          </button>

          <button
            className="btn bg-red-100 text-red-700 hover:bg-red-200 w-full sm:w-auto"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
