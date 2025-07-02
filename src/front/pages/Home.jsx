import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {
	const { store, dispatch } = useGlobalReducer();

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;

			if (!backendUrl)
				throw new Error("VITE_BACKEND_URL is not defined in .env file");

			const response = await fetch(backendUrl + "/api/hello");
			const data = await response.json();

			if (response.ok) dispatch({ type: "set_hello", payload: data.message });

			return data;
		} catch (error) {
			if (error.message)
				throw new Error(
					`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
				);
		}
	};

	useEffect(() => {
		loadMessage();
	}, []);

	return (
		<div className="container text-center mt-5">
			<h1 className="display-4 mb-4">Sistema de Inventarios y Tickets IT</h1>
		</div>
	);
};