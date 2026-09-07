import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import http from "../../../httpclient";
import { ACCESS_TOKEN } from "../../../urlconst";
import logo from "../../assets/newLogo.svg";
import { login } from "../../services/userService";

export default function Login() {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      setIsValid(false);
      return;
    } else {
      http
        .get("v1/userdetails")
        .then(() => navigate("/dashboard"))
        .catch(() => {
          localStorage.clear();
          setIsValid(false);
        });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(formData.email, formData.password)
      .then((res) => {
        localStorage.setItem(ACCESS_TOKEN, res.data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        navigate("/dashboard");
      })
      .catch((error: any) => {
        Swal.fire("Error", error.response?.data?.message || "Login failed", "error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      {!isValid && (
        <div className="min-h-screen bg-gradient-to-br from-[#402510] to-[#917347] flex items-center justify-center p-4">
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
              Welcome Back
            </h2>
            <p className="text-sm text-gray-400 text-center mb-8">
              Sign in to your admin account
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@damarika.in"
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
                    className="w-full px-4 py-2.5 pr-11 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#8B4513] focus:ring-2 focus:ring-[#8B4513]/10 transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B4513] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#6d3a1f] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              Contact your administrator to request an account.
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}
