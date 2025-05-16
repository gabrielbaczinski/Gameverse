import React, { useContext } from "react";
import Login from "../componentes/Login.jsx";
import { AuthContext } from "../AuthContext";

function TelaLogin() {
  const { login } = useContext(AuthContext);

  return (
    <div>
      <Login onLoginSuccess={login} />
    </div>
  );
}

export default TelaLogin;
