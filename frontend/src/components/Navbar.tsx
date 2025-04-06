import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "./icons/Icon";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Menu button and logo */}
          <div className="flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
              onClick={toggleSidebar}
            >
              <span className="sr-only">Open sidebar menu</span>
              <Icon name="projects" />
            </button>

            <Link to="/" className="flex items-center">
              <img
                src="/solar-panel.svg"
                className="h-8 w-8 text-primary"
                alt="Renewable Energy Insights Hub Logo"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900 hidden md:block">
                Energy Insights
              </span>
            </Link>
          </div>

          {/* Right section: User info/actions */}
          <div className="flex items-center">
            {user && (
              <div className="flex items-center">
                <span className="hidden md:block mr-4 text-gray-700">
                  Hello, {user.username}
                </span>
                <div className="relative">
                  <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="ml-4 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <Icon name="close" className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
