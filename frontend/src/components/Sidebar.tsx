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
        className={`fixed inset-y-0 left-0 z-30 w-64 transform shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--color-card-bg)",
          borderRight: "1px solid var(--color-card-border)",
        }}
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
              <span
                className="ml-2 text-xl font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                Energy Insights
              </span>
            </div>
            <button
              onClick={toggleSidebar}
              className="focus:outline-none md:hidden"
              style={{ color: "var(--color-text-light)" }}
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
                      isActive ? "text-primary" : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive
                      ? "var(--color-primary-light)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-card-bg)"
                      : "var(--color-text)",
                  })}
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
