import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const RegisterForm = () => {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validación de contraseñas
        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden", {
                position: "bottom-right"
            });
            return;
        }

        // Validación de campos vacíos
        if (!username || !name || !surname || !email || !phone || !password) {
            toast.warning("Por favor, completa todos los campos", {
                position: "bottom-right"
            });
            return;
        }
        
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                username, 
                password, 
                name, 
                surname, 
                phone, 
                email, 
                role: "ROLE_USER" 
            }),
            redirect: "follow"
        };

        fetch("http://localhost:4003/api/v1/auth/register", requestOptions)
        .then(response => {
            if (!response.ok) {
                // Manejo de errores según el código de estado
                if (response.status === 400) {
                    toast.error("Datos inválidos. Verifica la información ingresada.", {
                        position: "bottom-right"
                    });
                } else if (response.status === 409) {
                    toast.error("El usuario o email ya existe. Intenta con otro.", {
                        position: "bottom-right"
                    });
                } else {
                    toast.error(`Error del servidor: ${response.status}`, {
                        position: "bottom-right"
                    });
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Respuesta del servidor:", data);
            localStorage.setItem("cloth-inc-token", data.access_token);
            toast.success("¡Registro exitoso! Redirigiendo...", {
                position: "bottom-right",
                autoClose: 1500
            });
            setTimeout(() => {
                navigate("/");
            }, 1500);
        })
        .catch(error => {
            console.error("Error:", error);
            // Error de red o conexión
            if (error.message.includes("fetch")) {
                toast.error("No se pudo conectar al servidor. Verifica tu conexión.", {
                    position: "bottom-right"
                });
            }
        });
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
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ingresa tu email" 
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-sky-600 sm:text-sm/6"
                            />
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
                        <div>
                            <button
                            type="submit" 
                            className="flex w-full justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-sky-500"
                            onClick={handleSubmit}
                            >
                                Registrarse
                            </button>
                        </div>
                    </form>
                    <p className="mt-2 text-center text-gray-500 text-sm/6">
                        Ya tienes cuenta? <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500">Iniciar Sesión</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default RegisterForm;