import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Layout from "./layout";
import Auth from "./pages/auth";
import ForgotPassword from "./pages/forgotPassword";
import Home from "./pages/home";
import Profile from "./pages/profile";
import Search from "./pages/search";
import Explore from "./pages/explore";
import NotFound from "./pages/notFound";
import "./App.css";

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" />;
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Layout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "explore", element: <Explore /> },
      { path: "profile", element: <Profile /> },
      { path: "profile/:id", element: <Profile /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
