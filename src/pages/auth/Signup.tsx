import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import http from "../../../httpclient";
import {
  ACCESS_TOKEN,
  ROLE_CACHE_KEY,
  ROLE_CACHE_TIME_KEY,
} from "../../../urlconst";
import logo from "../../assets/newLogo.svg";
import {
  getRoles,
  register,
  RoleType,
  UserType,
} from "../../services/userService";

export default function Signup() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [formData, setFormData] = React.useState<UserType>({} as UserType);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsValid(false);
      return;
    } else {
      http
        .get("/v1/admin/admins")
        .then(() => navigate("/dashboard"))
        .catch(() => {
          localStorage.clear();
          setIsValid(false);
        });
    }
  }, []);

  useLayoutEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        const now = new Date().getTime();
        const data: any[] = response.data.data
          .filter((role: RoleType) => role.status === true)
          .map((role: RoleType) => ({
            role_name:
              role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1),
            id: role.id,
          }));
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(ROLE_CACHE_TIME_KEY, now.toString());
        setRoles(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (roles.length > 0 && !formData.role_id) {
      setFormData((prev) => ({
        ...prev,
        role_id: Number(roles[0]?.id),
      }));
    }
  }, [roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await register(formData)
      .then((res) => {
        localStorage.setItem(ACCESS_TOKEN, res.data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        navigate("/dashboard");
      })
      .catch((err: any) => {
        Swal.fire("Error", err.response?.data?.message || "Registration failed", "error");
      })
      .finally(() => setLoading(false));
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 transition-all";

  return (
    <>
      {!isValid && (
        <div className="min-h-screen bg-[url('https://images.damarika.in/uploads/f58bbe1f83982f8ac29a.jpeg')] bg-cover bg-center flex items-center justify-center p-4">
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black/40" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative bg-white/95 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-[420px]"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logo} alt="Damarika" className="h-16" />
            </div>

            <h2 className="text-2xl font-bold text-[#1a1a2e] text-center mb-1">
              Create Account
            </h2>
            <p className="text-sm text-gray-400 text-center mb-8">
              Register a new admin account
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  className={inputClass}
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={formData.email || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@damarika.in"
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`${inputClass} pr-11`}
                    value={formData.password || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="7-10 chars, upper, lower, number, special"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,10}$"
                    title="Password must be 7-10 characters, include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Role
                </label>
                <select
                  className={inputClass}
                  value={formData.role_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role_id: Number(e.target.value),
                    })
                  }
                >
                  {roles.map((role: any) => (
                    <option key={role.id} value={Number(role.id)}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4513] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#6d3a1f] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-[#8B4513] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}
