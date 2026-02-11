import { useState } from "react";
import axios from "axios";

function Register() {
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        restaurantName,
        email,
        password,
      });

      setSuccess("Compte créé ! Tu peux maintenant te connecter.");
      setError("");

    } catch (err) {
      setError("Erreur lors de l'inscription");
      setSuccess("");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Inscription</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Nom du restaurant"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary">Créer un compte</button>
      </form>
    </div>
  );
}

export default Register;