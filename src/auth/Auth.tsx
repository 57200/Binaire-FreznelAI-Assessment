import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

export function Auth({
  onLogin,
}: {
  onLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");

    const action = signup
      ? createUserWithEmailAndPassword(auth, email, password)
      : signInWithEmailAndPassword(auth, email, password);

    action
      .then(onLogin)
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ padding: 40, maxWidth: 400 }}>
      <h1>{signup ? "Create Account" : "Login"}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px 0", padding: 10 }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "10px 0", padding: 10 }}
      />

      <button onClick={submit}>
        {signup ? "Sign Up" : "Login"}
      </button>

      <button
        onClick={() => setSignup(!signup)}
        style={{ marginLeft: 10 }}
      >
        {signup ? "Login" : "Create Account"}
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}

export function Logout({ onLogout }: { onLogout: () => void }) {
  return (
    <button
      onClick={() => signOut(auth).then(onLogout)}
    >
      Logout
    </button>
  );
}