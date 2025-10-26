import "./App.css";
import AdminPage from "./pages/admin/adminPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/homePage";
import Testing from "./components/testing";
import Login from "./pages/login/login";
import toast, { Toaster } from "react-hot-toast";
import Register from "./pages/register/register";
import { GoogleOAuthProvider } from "@react-oauth/google";
import VerifyEmail from "./pages/verifyEmail/verifyEmail";
import { Payment } from "./pages/home/payment";
import BookingConfirmation from "./pages/home/bookingConfirmation";
import DriverRegister from "./pages/driver signup/drregister";
import DriverPage from "./pages/driver/driverPage";
import Shop from "./pages/shop/shop";

function App() {
  return (
    <GoogleOAuthProvider clientId="964342724823-ab0mb63lplaien2p6aoppalsanavjs84.apps.googleusercontent.com">
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes path="/">
          <Route path="/*" element={<HomePage />} />
          <Route path="/testing" element={<Testing />} />
          <Route path="/login" element={<Login />} />
          <Route path="admin/*" element={<AdminPage />} />
          <Route path="/register/*" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="shopC/*" element={<Shop />} />
          <Route path="/driver-signup" element={<DriverRegister />} />
          <Route path="driver/*" element={<DriverPage />} />

          <Route
            path="/bookingconfirmation"
            element={<BookingConfirmation />}
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
