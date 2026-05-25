# RunTimer Web

Aplicacion web en React + Vite para autenticacion, monitoreo y visualizacion de competencias de robots usando Firebase.

## Requisitos

- Node.js 20+
- Una configuracion valida de Firebase Web

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`.

## Scripts

- `npm run dev`: servidor local con Vite
- `npm run build`: build de produccion
- `npm run lint`: validacion con ESLint
- `npm run preview`: servir el build localmente

## Firebase Hosting

El proyecto incluye:

- `firebase.json` para publicar la carpeta `dist`
- `.firebaserc` apuntando al proyecto `runtimer-b1688`
- workflow de GitHub Actions para preview en PR y deploy live en `main`

El despliegue esta pensado solo para Firebase Hosting estatico. No usa Cloud Run, Cloud Functions ni Firebase App Hosting.

## Secretos de GitHub requeridos

- `FIREBASE_SERVICE_ACCOUNT`: JSON completo de una service account con permisos de deploy a Firebase Hosting

## Variables de GitHub requeridas

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Notas

- Firestore y Realtime Database usan reglas distintas. La app asume que Firestore requiere autenticacion y que RTDB puede proveer telemetria de tiempo real.
- Si es el primer deploy de Hosting para el proyecto, habilita Firebase Hosting en la consola antes de ejecutar el workflow.
