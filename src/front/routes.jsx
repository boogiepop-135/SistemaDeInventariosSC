// Import necessary components and functions from react-router-dom.

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { CrearTicket } from "./pages/CrearTicket";
import { Tickets } from "./pages/Tickets";
import { Login } from "./pages/Login";
import { TicketDetalle } from "./pages/TicketDetalle";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >
      {/* Solo rutas de tickets y login */}
      <Route index element={<Tickets />} />
      <Route path="login" element={<Login />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="tickets/crear" element={<CrearTicket />} />
      <Route path="tickets/:ticket_id" element={<TicketDetalle />} />
    </Route>
  )
);