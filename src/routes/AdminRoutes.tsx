import React, { lazy, Suspense, memo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminProtectedRoute from "../hooks/AdminProtectedRoute"; 


// Lazy-loaded components
const AdminLogin = lazy(() => import("../pages/auth/AdminLogin"));
const SidebarLayout = lazy(() => import("../layouts/SidebarLayout"));
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const SubscriptionsList = lazy(() => import("../pages/subscriptions/SubscriptionList"));
const CreateSubscription = lazy(() => import("../pages/subscriptions/CreateSubscription"));
const EditSubscription = lazy(() => import("../pages/subscriptions/EditSubscription"));
const UsersList = lazy(() => import("../pages/users/UserList"));
const UserView = lazy(() => import("../pages/users/UserViewDetails"));



const AdminLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-b-4 mx-auto mb-4"></div>
      <p className="text-white-600">Loading Admin Panel...</p>
    </div>
  </div>
);

const AdminRoutes: React.FC = memo(() => {
  return (
    <Suspense fallback={<AdminLoader />}>
      <Routes>
        {/* Public Route - Login only */}


        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/login" element={<AdminLogin />} />

        {/* ALL OTHER ROUTES ARE PROTECTED */}
        <Route 
          path="/*" 
          element={
            <AdminProtectedRoute>
              <Routes>
                <Route element={<SidebarLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/subscriptions-list" element={<SubscriptionsList />} />
                  <Route path="/create-subscription" element={<CreateSubscription />} />
                  <Route path="/edit-subscription/:id" element={<EditSubscription />} />
                  <Route path="/users" element={<UsersList />} />
<Route path="/view-user/:id" element={<UserView />} />


                </Route>
              </Routes>
            </AdminProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
});

export default AdminRoutes;