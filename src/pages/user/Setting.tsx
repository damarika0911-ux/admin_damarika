import { Chip } from "@mui/material";
import { motion } from "framer-motion";
import { Mail, Phone, Shield, UserCheck, Clock } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  CACHE_DURATION,
  ROLE_CACHE_KEY,
  ROLE_CACHE_TIME_KEY,
} from "../../../urlconst";
import {
  getRoles,
  RoleType,
  userDataDetails,
} from "../../services/userService";
import GlobalLoader from "../../utils/loader";

interface UserData {
  name: string;
  email: string;
  phoneNumber: string;
  image: string;
  status?: boolean;
  user_verify?: string;
  role: string;
  role_name?: string;
  createdBy: string;
  createdAt?: string;
}

export default function Setting() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    phoneNumber: "",
    image: "",
    role: "",
    createdBy: "",
  });
  const [roles, setRoles] = useState<{ label: string; value: number }[]>([]);

  useLayoutEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchRoles = async () => {
      const now = Date.now();
      const lastFetch = parseInt(localStorage.getItem(ROLE_CACHE_TIME_KEY) || "0", 10);
      const cached = localStorage.getItem(ROLE_CACHE_KEY);
      if (cached && now - lastFetch < CACHE_DURATION) {
        setRoles(JSON.parse(cached));
        return;
      }
      try {
        const res = await getRoles();
        const data = res.data.data
          .filter((r: RoleType) => r.status)
          .map((r: RoleType) => ({
            label: r.role_name.charAt(0).toUpperCase() + r.role_name.slice(1),
            value: parseInt(r.id.toString(), 10),
          }));
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(ROLE_CACHE_TIME_KEY, now.toString());
        setRoles(data);
      } catch {}
    };
    fetchRoles();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await userDataDetails();
      const user = response.data.data;
      setUserData({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        image: user.image || "",
        status: user.status,
        user_verify: user.user_verify,
        role_name: user.role_name || "",
        role: roles.find((r) => r.value === user.role_id)?.label || user.role_name || "User",
        createdBy: user.created_by,
        createdAt: user.createdAt,
      });
    } catch {
      Swal.fire({ title: "Error!", text: "Failed to load user data", icon: "error", toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = userData.name
    ? userData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const infoItems = [
    { icon: Mail, label: "Email", value: userData.email },
    { icon: Phone, label: "Phone", value: userData.phoneNumber || "Not set" },
    { icon: Shield, label: "Role", value: userData.role },
    { icon: UserCheck, label: "Verification", value: userData.user_verify || "Not verified" },
    { icon: Clock, label: "Member since", value: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : "Unknown" },
  ];

  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Profile Header */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div className="h-28" style={{ background: "linear-gradient(135deg, #8B4513 0%, #6d3a1f 50%, #4a2810 100%)" }} />
          <div className="px-6 pb-6" style={{ marginTop: "-3rem" }}>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                {userData.image ? (
                  <img src={userData.image} alt={userData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: "linear-gradient(135deg, #8B4513, #cd853f)" }}>
                    {initials}
                  </div>
                )}
              </div>
              {/* Name & Status */}
              <div className="flex-1 pb-1">
                <h2 className="text-xl font-bold text-[#1a1a2e]">{userData.name || "Loading..."}</h2>
                <p className="text-sm text-gray-400">{userData.email}</p>
              </div>
              <div className="flex gap-2 pb-1">
                <Chip
                  label={userData.status ? "Active" : "Inactive"}
                  color={userData.status ? "success" : "error"}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                />
                <Chip
                  label={userData.role}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: "0.7rem", bgcolor: "rgba(139,69,19,0.08)", color: "#8B4513" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {infoItems.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl p-4 flex items-center gap-3"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "rgba(139,69,19,0.06)" }}>
                <item.icon className="w-[18px] h-[18px] text-[#8B4513]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                <p className="text-sm font-medium text-[#1a1a2e] truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}
