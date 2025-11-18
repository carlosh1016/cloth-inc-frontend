import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Product from "./views/Product";
import Home from "./views/Home";
import Login from "./views/Login";
import Register from "./views/Register";
import Search from "./views/Search";
import Shop from "./views/Shop";
import Cart from "./views/Cart";
import { CartProvider } from "./components/CartContext";
import Checkout from "./views/Checkout";

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ToastContainer
          position="bottom-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shop" element={<Shop />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
