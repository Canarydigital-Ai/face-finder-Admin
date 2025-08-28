import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import { ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { useAnalytics } from "./hooks/useAnalytics";

function App() {
  // useAnalytics();

  return (
    <>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;