import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Contact,
  FolderTree,
  Landmark,
  Map,
  Package,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getArchaelogicals } from "../services/archaelogicalSerivce";
import { getContacts } from "../services/contactFrom";
import { getDistricts } from "../services/districtService";
import { getPeoples } from "../services/peopleService";
import { getProductCategories } from "../services/productCategorySerivce";
import { getProducts } from "../services/productService";
import { getPrograms } from "../services/programService";
import { getRoles } from "../services/roleSerivce";
import { getAllUsers } from "../services/userService";
import GlobalLoader from "../utils/loader";

type StatCard = {
  label: string;
  value: number;
  icon: React.ElementType;
  path: string;
  color: string;
  bg: string;
};

type RecentItem = {
  id: number;
  name: string;
  type: string;
  date: string;
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    users: 0,
    products: 0,
    categories: 0,
    programs: 0,
    roles: 0,
    people: 0,
    districts: 0,
    sites: 0,
    contacts: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  const userName = useMemo(() => {
    try {
      const user = localStorage.getItem("user");
      if (user) return JSON.parse(user).name || "Admin";
    } catch {}
    return "Admin";
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          getAllUsers(),
          getProducts(),
          getProductCategories(),
          getPrograms(),
          getRoles(),
          getPeoples(),
          getDistricts(),
          getArchaelogicals(),
          getContacts(),
        ]);

        const getData = (r: PromiseSettledResult<any>) =>
          r.status === "fulfilled" ? r.value?.data?.data || [] : [];

        const usersData = getData(results[0]);
        const productsData = getData(results[1]);
        const categoriesData = getData(results[2]);
        const programsData = getData(results[3]);
        const rolesData = getData(results[4]);
        const peopleData = getData(results[5]);
        const districtsData = getData(results[6]);
        const sitesData = getData(results[7]);
        const contactsData = getData(results[8]);

        setCounts({
          users: usersData.length,
          products: productsData.length,
          categories: categoriesData.length,
          programs: programsData.length,
          roles: rolesData.length,
          people: peopleData.length,
          districts: districtsData.length,
          sites: sitesData.length,
          contacts: contactsData.length,
        });

        // Build recent items from all data
        const allItems: RecentItem[] = [];
        const addRecent = (arr: any[], type: string) => {
          arr.forEach((item: any) => {
            allItems.push({
              id: item.id,
              name: item.name || item.title || item.subject || "Untitled",
              type,
              date: item.createdAt || item.updatedAt || "",
            });
          });
        };

        addRecent(usersData, "User");
        addRecent(productsData, "Product");
        addRecent(programsData, "Program");
        addRecent(contactsData, "Contact");
        addRecent(peopleData, "People");

        allItems.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setRecentItems(allItems.slice(0, 8));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const stats: StatCard[] = [
    { label: "Users", value: counts.users, icon: Users, path: "/users", color: "#6366f1", bg: "#EEF2FF" },
    { label: "Products", value: counts.products, icon: Package, path: "/products", color: "#8B4513", bg: "#FDF2E9" },
    { label: "Categories", value: counts.categories, icon: FolderTree, path: "/product-category", color: "#059669", bg: "#ECFDF5" },
    { label: "Programs", value: counts.programs, icon: CalendarDays, path: "/programs", color: "#d97706", bg: "#FFFBEB" },
    { label: "Roles", value: counts.roles, icon: Shield, path: "/roles", color: "#7c3aed", bg: "#F5F3FF" },
    { label: "People", value: counts.people, icon: Users, path: "/people", color: "#0891b2", bg: "#ECFEFF" },
    { label: "Districts", value: counts.districts, icon: Map, path: "/district", color: "#be185d", bg: "#FDF2F8" },
    { label: "Arch. Sites", value: counts.sites, icon: Landmark, path: "/archaelogic", color: "#92400e", bg: "#FEF3C7" },
    { label: "Contacts", value: counts.contacts, icon: Contact, path: "/contact", color: "#dc2626", bg: "#FEF2F2" },
  ];

  const quickLinks = [
    { label: "Add User", path: "/users", icon: Users },
    { label: "Add Product", path: "/products", icon: Package },
    { label: "Add Program", path: "/programs", icon: CalendarDays },
    { label: "View Contacts", path: "/contact", icon: Contact },
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const typeColors: Record<string, string> = {
    User: "#6366f1",
    Product: "#8B4513",
    Program: "#d97706",
    Contact: "#dc2626",
    People: "#0891b2",
  };

  return (
    <>
      <GlobalLoader isLoading={loading} />

      <motion.div variants={container} initial="hidden" animate="show">
        {/* Welcome Banner */}
        <motion.div
          variants={item}
          className="rounded-2xl p-6 sm:p-8 mb-6"
          style={{
            background: "linear-gradient(135deg, #8B4513 0%, #6d3a1f 50%, #4a2810 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Welcome back, {userName}
              </h1>
              <p className="text-white/60 text-sm">
                Here's what's happening with Damarika today
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-white/90 text-sm font-medium">
                {counts.users + counts.products + counts.programs} total records
              </span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item}>
              <Link
                to={stat.path}
                className="block bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: stat.bg }}
                  >
                    <stat.icon
                      className="w-5 h-5"
                      style={{ color: stat.color }}
                    />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#1a1a2e] mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {stat.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom Grid: Quick Actions + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Quick Actions */}
          <motion.div
            variants={item}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <h2 className="text-sm font-semibold text-[#1a1a2e] mb-4 uppercase tracking-wide">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.path}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F7F8FA] hover:bg-[#8B4513]/5 border border-transparent hover:border-[#8B4513]/10 transition-all group"
                >
                  <link.icon className="w-5 h-5 text-gray-400 group-hover:text-[#8B4513] transition-colors" />
                  <span className="text-xs font-medium text-gray-500 group-hover:text-[#6d3a1f] transition-colors text-center">
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={item}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5"
          >
            <h2 className="text-sm font-semibold text-[#1a1a2e] mb-4 uppercase tracking-wide">
              Recent Activity
            </h2>
            {recentItems.length > 0 ? (
              <div className="space-y-1">
                {recentItems.map((entry, i) => (
                  <div
                    key={`${entry.type}-${entry.id}-${i}`}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#F7F8FA] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: typeColors[entry.type] || "#8B4513",
                        }}
                      />
                      <span className="text-sm text-[#2D3748] truncate">
                        {entry.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          color: typeColors[entry.type] || "#8B4513",
                          backgroundColor:
                            (typeColors[entry.type] || "#8B4513") + "10",
                        }}
                      >
                        {entry.type}
                      </span>
                      <span className="text-xs text-gray-400 w-16 text-right">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CalendarDays className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
