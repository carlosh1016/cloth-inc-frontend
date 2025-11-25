import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerUser } from "../../redux/registerSlice";
import { setAuthState } from "../../redux/loginSlice";

const RegisterForm = () => {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isVendedor, setIsVendedor] = useState(false);
    const [emailError, setEmailError] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { status } = useSelector((state) => state.register);
    
    // Función para validar formato de email
    const isValidEmail = (email) => {
        // Regex estándar para validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Manejar cambio de email con validación en tiempo real
    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        
        // Validar solo si el campo no está vacío
        if (value.trim() && !isValidEmail(value)) {
            setEmailError("Formato de correo inválido");
        } else {
            setEmailError("");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación de campos vacíos
        if (!username || !name || !surname || !email || !phone || !password) {
            toast.warning("Por favor, completa todos los campos", {
                position: "bottom-right"
            });
            return;
        }

        // Validación de formato de email
        if (!isValidEmail(email)) {
            toast.error("Por favor, ingresa un correo electrónico válido", {
                position: "bottom-right"
            });
            return;
        }
        
        // Validación de contraseñas
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden", {
                position: "bottom-right"
            });
            return;
        }
        
        const role = isVendedor ? "ROLE_SELLER" : "ROLE_USER";

        const resultAction = await dispatch(
            registerUser({ username, password, name, surname, phone, email, role })
        );

        if (registerUser.fulfilled.match(resultAction)) {
            const { token, role, shopId, userId } = resultAction.payload;

            // Auto-login: actualizamos el slice de auth
            dispatch(
                setAuthState({
                    token,
                    role,
                    shopId,
                    userId,
                })
            );

            toast.success("¡Registro exitoso! Redirigiendo...", {
                position: "bottom-right",
                autoClose: 1500,
            });
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } else if (registerUser.rejected.match(resultAction)) {
            const payloadError = resultAction.payload;

            if (payloadError?.status === 400) {
                toast.error("Datos inválidos. Verifica la información ingresada.", {
                    position: "bottom-right",
                });
            } else if (payloadError?.status === 409) {
                toast.error("El usuario o email ya existe. Intenta con otro.", {
                    position: "bottom-right",
                });
            } else if (payloadError?.status) {
                toast.error(`Error del servidor: ${payloadError.status}`, {
                    position: "bottom-right",
                });
            } else {
                toast.error("No se pudo conectar al servidor. Verifica tu conexión.", {
                    position: "bottom-right",
                });
            }
        }
    }
    return (
        <>
            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <h1 className="text-center text-8xl font-bold tracking-tight text-rose-600">
                        Cloth Inc
                    </h1>
                    <h2 className="text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Registrarse
                    </h2>
                </div>
                <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">Nombre de usuario</label>
                            <input 
                            type="text" 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingresa tu nombre de usuario" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900">Nombre</label>
                            <input 
                            type="text" 
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ingresa tu nombre" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="surname" className="block text-sm/6 font-medium text-gray-900">Apellido</label>
                            <input 
                            type="text" 
                            id="surname"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder="Ingresa tu apellido" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">Correo electrónico</label>
                            <input 
                            type="email" 
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="Ingresa tu email" 
                            className={`block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${
                                emailError ? "outline-red-500 focus:outline-red-500" : "focus:outline-sky-600"
                            }`}
                            />
                            {emailError && (
                                <p className="mt-1 text-sm text-red-600">{emailError}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900">Teléfono</label>
                            <input 
                            type="tel" 
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Ingresa tu teléfono" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm/6 font-medium text-gray-900">Contraseña</label>
                            <input 
                            type="password" 
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm/6 font-medium text-gray-900">Confirmar contraseña</label>
                            <input 
                            type="password" 
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirma tu contraseña" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
                        </div>
                        <div className="inline-flex items-center">
                            <label className="flex items-center cursor-pointer relative" htmlFor="isVendedor">
                                <input type="checkbox"
                                checked={isVendedor}
                                onChange={(e) => setIsVendedor(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-slate-300 checked:bg-slate-800 checked:border-slate-800"
                                id="isVendedor" />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"
                                    stroke="currentColor" strokeWidth="1">
                                    <path fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"></path>
                                </svg>
                                </span>
                            </label>
                            <label className="cursor-pointer ml-2 font-medium font-semibold text-gray-900 text-sm" htmlFor="isVendedor">
                                ¿Eres vendedor?
                            </label>
                            </div>
                        <div>
                            <button
                            type="submit" 
                            className="flex w-full justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={status === "loading"}
                            >
                                {status === "loading" ? "Registrando..." : "Registrarse"}
                            </button>
                        </div>
                    </form>
                    <p className="mt-2 text-center text-gray-500 text-sm/6 mb-16">
                        Ya tienes cuenta? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500">Iniciar Sesión</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default RegisterForm;