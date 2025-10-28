import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "@/styles/ai.css";
import "@/styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext"; 
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <WishlistProvider>   
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster
          position="bottom-center"
          duration={1700}
          richColors
          closeButton
        />
      </WishlistProvider>
    </AuthProvider>
  </React.StrictMode>
);
