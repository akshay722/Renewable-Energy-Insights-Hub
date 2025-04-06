import { NavLink } from "react-router-dom";
import Icon from "./icons/Icon";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, toggleSidebar }: SidebarProps) => {
  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      iconName: "dashboard" as const,
    },
    {
      name: "Projects",
      path: "/projects",
      iconName: "projects" as const,
    },
    {
      name: "Profile",
      path: "/profile",
      iconName: "profile" as const,
    },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="flex h-16 items-center justify-between px-4 md:hidden">
            <div className="flex items-center">
              <img
                src="/solar-panel.svg"
                className="h-8 w-8 text-primary"
                alt="Renewable Energy Insights Hub Logo"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                Energy Insights
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
            >
              <Icon name="close" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2.5 text-base font-medium transition-colors duration-200 rounded-lg ${
                      isActive
                        ? "bg-primary-light/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      toggleSidebar();
                    }
                  }}
                >
                  <span className="mr-3">
                    <Icon name={item.iconName} />
                  </span>
                  {item.name}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Sidebar footer */}
          <div className="mt-auto px-4 pb-6">
            <div className="rounded-lg bg-primary-light/10 p-4">
              <h3 className="font-medium text-primary">Need Help?</h3>
              <p className="mt-1 text-sm text-gray-600">
                Check out our documentation or contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
