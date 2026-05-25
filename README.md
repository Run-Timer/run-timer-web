# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

<div className="flex items-center mb-8">
          <div className="flex-1 h-px bg-zinc-700"></div>

          <span className="px-4 text-sm text-gray-400 font-medium">
            O continua con
          </span>

          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        <button
          className="
            w-full
            flex
            items-center
            justify-center
            gap-3
            bg-white
            hover:bg-gray-100
            hover:scale-[1.02]
            active:scale-95
            transition-all
            duration-300
            rounded-2xl
            py-4
            text-black
            font-semibold
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
    </div>
  );
}
