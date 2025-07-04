const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      // Tu estado inicial
      token: localStorage.getItem("token") || null,
      role: localStorage.getItem("role") || null,
      // Puedes añadir más estados aquí
    },
    actions: {
      // Tus acciones para modificar el estado
      login: (token, role) => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        setStore({ token, role });
      },
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setStore({ token: null, role: null });
      },
      syncSessionData: () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role) {
          setStore({ token, role });
        }
      },
    },
  };
};

export default getState;
