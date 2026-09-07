import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Contact,
  FolderTree,
  LayoutDashboard,
  Landmark,
  LogOut,
  Map,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/newLogo.svg";

type NavSection = {
  title: string;
  items: { icon: React.ElementType; label: string; path: string }[];
};

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    title: "Management",
    items: [
      { icon: Users, label: "Users", path: "/users" },
      { icon: Shield, label: "Roles", path: "/roles" },
      { icon: Users, label: "People", path: "/people" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { icon: Package, label: "Products", path: "/products" },
      { icon: FolderTree, label: "Categories", path: "/product-category" },
      { icon: CalendarDays, label: "Programs", path: "/programs" },
    ],
  },
  {
    title: "Geography",
    items: [
      { icon: Map, label: "Districts", path: "/district" },
      { icon: Landmark, label: "Archaeological Sites", path: "/archaelogic" },
    ],
  },
  {
    title: "Communication",
    items: [{ icon: Contact, label: "Contact", path: "/contact" }],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? 72 : 240;

  const currentPage = useMemo(() => {
    return (
      allNavItems.find((item) => item.path === location.pathname)?.label ||
      "Dashboard"
    );
  }, [location.pathname]);

  const userName = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.name || parsed.email || "Admin";
      }
    } catch {}
    return "Admin";
  }, []);

  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user && !location.pathname.includes("/auth")) {
      navigate("/auth/login");
    } else if (user) {
      setIsAuthenticated(true);
    }
  }, [location, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  if (!isAuthenticated && !location.pathname.includes("/auth")) {
    return null;
  }

  if (location.pathname.includes("/auth")) {
    return <>{children}</>;
  }

  const NavLink = ({
    item,
    isActive,
  }: {
    item: { icon: React.ElementType; label: string; path: string };
    isActive: boolean;
  }) => (
    <Link
      to={item.path}
      onClick={() => setSidebarOpen(false)}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 rounded-lg text-[13px] transition-all duration-200 group ${
        collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2 mx-0"
      } ${
        isActive
          ? "bg-[#8B4513] text-white font-medium shadow-sm shadow-[#8B4513]/25"
          : "text-gray-500 hover:bg-[#8B4513]/5 hover:text-[#6d3a1f]"
      }`}
    >
      <item.icon
        className={`w-4 h-4 flex-shrink-0 ${
          isActive ? "text-white" : "text-gray-400 group-hover:text-[#8B4513]"
        }`}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && (
        <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70" />
      )}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Desktop Sidebar */}
      <aside
        className="bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-full z-20 transition-all duration-300 ease-out"
        style={{ width: sidebarWidth }}
      >
        {/* Logo */}
        <div
          className={`flex items-center py-5 ${
            collapsed ? "justify-center px-2" : "justify-center px-4"
          }`}
        >
          <img
            src={logo}
            alt="Damarika"
            className={`transition-all duration-300 ${
              collapsed ? "h-8 w-8 object-contain" : "h-14 w-auto"
            }`}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 sidebar-scroll">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              {!collapsed && (
                <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {section.title}
                </p>
              )}
              {collapsed && (
                <div className="border-t border-gray-100 my-2 mx-2" />
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-2">
          <Link
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center gap-3 rounded-lg text-[13px] mb-1 transition-colors ${
              collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
            } ${
              location.pathname === "/settings"
                ? "bg-[#8B4513] text-white font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-[13px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors ${
              collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-3 rounded-lg text-[13px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors mt-1 ${
              collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar (always full width) */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] bg-white shadow-2xl z-40 flex flex-col transform transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-5 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center py-5 px-4">
          <img src={logo} alt="Damarika" className="h-14 w-auto" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 sidebar-scroll">
          {navSections.map((section) => (
            <div key={section.title} className="mb-3">
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {section.title}
              </p>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="border-t border-gray-100 p-3">
          <Link
            to="/settings"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] mb-1 transition-colors ${
              location.pathname === "/settings"
                ? "bg-[#8B4513] text-white font-medium"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 min-h-screen transition-all duration-300 ease-out hidden lg:block"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Desktop Header */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#2D3748]"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <h1 className="text-lg font-semibold text-[#1a1a2e]">
                {currentPage}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-[#2D3748]">{userName}</p>
                <p className="text-[11px] text-gray-400">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#8B4513] flex items-center justify-center text-white text-sm font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>

      {/* Mobile Main Content */}
      <main className="flex-1 min-h-screen lg:hidden">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-[#2D3748]" />
            </button>
            <img src={logo} alt="Damarika" className="h-8" />
            <div className="w-9 h-9 rounded-full bg-[#8B4513] flex items-center justify-center text-white text-xs font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
