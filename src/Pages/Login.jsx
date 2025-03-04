import React from "react";

export default function Login() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Se connecter
        </h2>
        <p className="text-sm text-center text-gray-600 mb-8">
          Entrez votre email et mot de passe
        </p>

        <a
          href="#"
          className="flex items-center justify-center w-full py-3 mb-6 text-sm font-medium rounded-2xl text-gray-900 bg-gray-200 hover:bg-gray-300 transition"
        >
          <img
            className="h-5 mr-2"
            src="https://raw.githubusercontent.com/Loopple/loopple-public-assets/main/motion-tailwind/img/logos/logo-google.png"
            alt="Google"
          />
          Se connecter avec Google
        </a>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500 text-sm">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <form>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email*
          </label>
          <input
            type="email"
            placeholder="exemple@mail.com"
            className="w-full px-4 py-3 mb-5 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe*
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 mb-5 text-sm bg-gray-100 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <div className="flex justify-between items-center mb-6">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700">Rester connecté</span>
            </label>
            <a href="#" className="text-sm text-purple-600 hover:underline">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-3 rounded-2xl font-bold hover:bg-purple-700 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Pas encore inscrit ?{" "}
          <a href="/register" className="font-bold text-purple-600 hover:underline">
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  );
}
