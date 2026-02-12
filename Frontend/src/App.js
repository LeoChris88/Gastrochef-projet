import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Lab from "./pages/Lab";
import "./Styles/styles.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lab" element={<Lab />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;