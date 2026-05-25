import logo from "../assets/logo.svg";

import { motion } from "framer-motion";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
} from "lucide-react";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  registerUser,
  loginWithGoogle,
} from "../services/authService";

function Register() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [nombre, setNombre] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {

    try {

      setLoading(true);

      await registerUser(
        email,
        password,
        nombre
      );


      navigate("/");

    } catch (error) {

      console.error(error);

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  const handleGoogle = async () => {

    try {

      setLoading(true);

      await loginWithGoogle();



      navigate("/");

    } catch (error) {

      console.error(error);

      alert(error.message);

    } finally {

      setLoading(false);

    }
  };

  return (

    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "-100%", opacity: 0 }}
      transition={{
        duration: 0.4,
        ease: "easeInOut",
      }}
      className="min-h-screen bg-black flex items-center justify-center px-6"
    >

      <div className="w-full max-w-md">

        <div className="flex justify-center mb-6">

          <div className="w-28 h-28 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">

            <img
              src={logo}
              alt="RunTimer"
              className="w-full h-full object-cover"
            />

          </div>

        </div>

        <h1 className="text-white text-5xl font-bold text-center mb-3">
          Crear cuenta
        </h1>

        <p className="text-gray-400 text-center mb-10">
          Regístrate para continuar
        </p>

        <div className="relative mb-4">

          <User
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="
              w-full
              pl-12
              p-4
              rounded-2xl
              bg-zinc-900
              text-white
              border
              border-zinc-800
              outline-none
              focus:border-red-500
            "
          />

        </div>

        <div className="relative mb-4">

          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              pl-12
              p-4
              rounded-2xl
              bg-zinc-900
              text-white
              border
              border-zinc-800
              outline-none
              focus:border-red-500
            "
          />

        </div>

        <div className="relative mb-6">

          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="
              w-full
              pl-12
              pr-12
              p-4
              rounded-2xl
              bg-zinc-900
              text-white
              border
              border-zinc-800
              outline-none
              focus:border-red-500
            "
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          >

            {
              showPassword
                ? <EyeOff size={20} />
                : <Eye size={20} />
            }

          </button>

        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="
            w-full
            bg-red-500
            hover:bg-red-600
            transition
            rounded-2xl
            py-4
            text-white
            font-bold
            mb-8
            disabled:opacity-50
          "
        >

          {
            loading
              ? "Cargando..."
              : "Registrarse"
          }

        </button>

        <div className="flex items-center mb-8">

          <div className="flex-1 h-px bg-zinc-700"></div>

          <span className="px-4 text-sm text-gray-400 font-medium">
            O continua con
          </span>

          <div className="flex-1 h-px bg-zinc-700"></div>

        </div>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            bg-white
            hover:bg-gray-100
            transition
            rounded-2xl
            py-4
            text-black
            font-semibold
            disabled:opacity-50
          "
        >

          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />

          Continuar con Google

        </button>

      </div>

    </motion.div>
  );
}

export default Register;