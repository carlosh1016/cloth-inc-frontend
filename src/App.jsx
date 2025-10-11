import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import ProductScreen from "./screens/ProductScreen";
import Home from "./screens/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ProductScreen" element={<ProductScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
