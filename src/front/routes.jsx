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
import { Admin } from "./pages/Admin";
import { CrearRequisicion } from "./pages/CrearRequisicion";
import { VerRequisiciones } from "./pages/VerRequisiciones";
import { RequisicionDetalle } from "./pages/RequisicionDetalle";
import { TicketDetalle } from "./pages/TicketDetalle"; // Asegúrate de importar TicketDetalle

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      {/* Todas las rutas hijas aquí */}
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="inventario" element={<Inventario />} />
      <Route path="inventario/agregar" element={<AgregarInventario />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/crear" element={<CrearTicket />} />
      <Route path="tickets/:ticket_id" element={<TicketDetalle />} /> {/* Ruta para detalles del ticket */}
      <Route path="admin" element={<Admin />} />
      <Route path="single/:theId" element={<Single />} />
      <Route path="demo" element={<Demo />} />
      <Route path="requisiciones" element={<VerRequisiciones />} />
      <Route path="requisiciones/crear" element={<CrearRequisicion />} />
      <Route path="requisitions/:requisition_id" element={<RequisicionDetalle />} />
    </Route>
  )
);