import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./pages/user/PrivateRoute";
import GlobalLoader from "./utils/loader";

// Lazy load all pages — only loads when the route is visited
const Login = lazy(() => import("./pages/auth/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const UserList = lazy(() => import("./pages/user/UserList"));
const Product = lazy(() => import("./pages/user/Product"));
const ProductCategoryList = lazy(() => import("./pages/user/ProductCategory"));
const Order = lazy(() => import("./pages/user/Roles"));
const ProgramList = lazy(() => import("./pages/user/Program"));
const PeopleList = lazy(() => import("./pages/user/PeopleList"));
const DistrictList = lazy(() => import("./pages/user/District"));
const ArchaelogicalSiteList = lazy(() => import("./pages/user/ArchaelogicalSiteList"));
const ContactSystem = lazy(() => import("./components/ContactSystem"));
const Setting = lazy(() => import("./pages/user/Setting"));
const ServiceUnavailablePage = lazy(() => import("./pages/ServiceUnavailablePage"));

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  );
}

function App() {
  return (
    <Suspense fallback={<GlobalLoader isLoading />}>
      <Routes>
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Navigate to="/auth/login" replace />} />
        <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        <Route path="/users" element={<ProtectedPage><UserList /></ProtectedPage>} />
        <Route path="/products" element={<ProtectedPage><Product /></ProtectedPage>} />
        <Route path="/product-category" element={<ProtectedPage><ProductCategoryList /></ProtectedPage>} />
        <Route path="/roles" element={<ProtectedPage><Order /></ProtectedPage>} />
        <Route path="/programs" element={<ProtectedPage><ProgramList /></ProtectedPage>} />
        <Route path="/people" element={<ProtectedPage><PeopleList /></ProtectedPage>} />
        <Route path="/district" element={<ProtectedPage><DistrictList /></ProtectedPage>} />
        <Route path="/archaelogic" element={<ProtectedPage><ArchaelogicalSiteList /></ProtectedPage>} />
        <Route path="/contact" element={<ProtectedPage><ContactSystem /></ProtectedPage>} />
        <Route path="/settings" element={<ProtectedPage><Setting /></ProtectedPage>} />
        <Route path="/503" element={<ServiceUnavailablePage />} />
        <Route path="*" element={<ServiceUnavailablePage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
