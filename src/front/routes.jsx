// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Inventario } from "./pages/Inventario";
import { AgregarInventario } from "./pages/AgregarInventario";
import { CrearTicket } from "./pages/CrearTicket";
import { Tickets } from "./pages/Tickets";
import { Login } from "./pages/Login";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      {/* Todas las rutas hijas aquí */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inventario" element={<Inventario />} />
      <Route path="/inventario/agregar" element={<AgregarInventario />} />
      <Route path="/tickets/crear" element={<CrearTicket />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
    </Route>
  )
);