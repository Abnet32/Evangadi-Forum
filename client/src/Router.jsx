import { Route, Routes } from "react-router-dom";
import ChatbotLayout from "./Components/Layout/Layout";
import SimpleLayout from "./Components/Layout/SimpleLayout";
import Landing from "./pages/Landing/Landing";
import Home from "./pages/Home/Home";
import Question from "./pages/Question/Question";
import HowItWorks from "./pages/HowItWorks/HowItWorks";
import Answer from "./pages/Answer/Answer";

function Router() {
  return (
    <Routes>
      {/* Pages without Chatbot */}
      <Route element={<SimpleLayout />}>
        <Route path="/login" element={<Landing />} />
      </Route>

      {/* Pages with Chatbot */}
      <Route element={<ChatbotLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/question" element={<Question />} />
        <Route path="/home/answers/:questionId" element={<Answer />} />
      </Route>
    </Routes>
  );
}

export default Router;
