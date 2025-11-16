import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { loginUser } from "../../redux/loginSlice";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { status, error, isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const resultAction = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(resultAction)) {
      toast.success("¡Inicio de sesión exitoso! Redirigiendo...", {
        position: "bottom-right",
        autoClose: 1500,
      });
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else if (loginUser.rejected.match(resultAction)) {
      const payloadError = resultAction.payload;

      if (payloadError?.status === 401) {
        toast.error(
          "Credenciales incorrectas. Por favor, verifica tu email y contraseña.",
          { position: "bottom-right" }
        );
      } else if (payloadError?.status === 403) {
        toast.error("Acceso denegado. Por favor, contacta al administrador.", {
          position: "bottom-right",
        });
      } else if (payloadError?.status) {
        toast.error(`Error del servidor: ${payloadError.status}`, {
          position: "bottom-right",
        });
      } else {
        toast.error(
          "No se pudo conectar al servidor. Verifica tu conexión.",
          { position: "bottom-right" }
        );
      }
    }
  };
    return (
        <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h1 className="text-center text-8xl font-bold tracking-tight text-rose-600">
            Cloth Inc
          </h1>
          <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
            Iniciar sesión
          </h2>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
          <form action="#" method="POST" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                  value={email}
                  placeholder="Ingresa tu email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">
                  Contraseña
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-sky-600 hover:text-sky-500">
                    Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                  value={password}
                  placeholder="Ingresa tu contraseña"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <p className="mt-2 text-center text-sm/6 text-gray-500">
            No tienes una cuenta?{' '}
            <Link to="/register" className="font-semibold text-sky-600 hover:text-sky-500">Registrarse</Link>
          </p>
        </div>
      </div>
    </>
    );
};

export default LoginForm;