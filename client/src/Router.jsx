import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/Routes/ProtectedRoute";
import PublicRoute from "./Components/Routes/PublicRoute";

// Pages
import Landing from "./Pages/Landing/Landing";
import Home from "./Pages/Home/Home";
import Groups from "./Pages/Groups/Groups";
import Question from "./Pages/Question/Question";
import Answer from "./Pages/Answer/Answer";
import Article from "./Components/Articles/Articles";
import HowItWorks from "./Pages/HowItWorks/HowItWorks";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./Pages/ForgotPassword/ResetPassword";

// Layouts
import ChatbotLayout from "./Components/Layout/Layout";
import SimpleLayout from "./Components/Layout/SimpleLayout";
import NotFound from "./Pages/NotFound/NotFound";

function Router() {
  return (
    <Routes>
      {/* Public Routes (No Chatbot) */}
      <Route element={<SimpleLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected Routes (With Chatbot) */}
      <Route element={<ChatbotLayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/article"
          element={
            <ProtectedRoute>
              <Article />
            </ProtectedRoute>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <ProtectedRoute>
              <HowItWorks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community-groups"
          element={
            <ProtectedRoute>
              <Groups />
            </ProtectedRoute>
          }
        />
        <Route
          path="/question"
          element={
            <ProtectedRoute>
              <Question />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home/answers/:questionId"
          element={
            <ProtectedRoute>
              <Answer />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Not Found */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default Router;
