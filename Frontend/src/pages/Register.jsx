import { useState } from "react";
import axios from "axios";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,   // 🔥 ON ENVOIE username
        email,
        password,
      });

      setSuccess("Compte créé !");
      setError("");
      console.log(res.data);

    } catch (err) {
      console.error("ERREUR BACKEND :", err.response?.data); // 🔥 IMPORTANT
      setError(err.response?.data?.message || "Erreur inscription");
      setSuccess("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inscription</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom du restaurant"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Créer un compte</button>
      </form>
    </div>
  );
}

export default Register;