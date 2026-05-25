# Firebase + GitHub Actions Setup

Este proyecto se desplegara solo como sitio estatico en Firebase Hosting.

Estrategia elegida para este repositorio:

- preview por Pull Request
- deploy live al hacer merge o push a `main`

No requiere:

- Cloud Run
- Cloud Functions
- Firebase App Hosting

Esto encaja con el uso de Firebase Hosting en plan gratuito con sus cuotas sin costo.

## 1. Crear la service account

En Google Cloud Console, dentro del proyecto `runtimer-b1688`, crea una service account dedicada para GitHub Actions.

Nombre sugerido:

- `github-actions-runtimer-web`

## 2. Asignar roles

Asigna estos roles:

- `Firebase Hosting Admin`
- `Firebase Authentication Admin`
- `API Keys Viewer`

`Firebase Authentication Admin` sigue siendo util si vas a usar preview channels y autenticacion con Firebase, porque la accion oficial puede necesitar registrar dominios de preview en Auth.

No necesitas `Cloud Run Viewer` para este proyecto mientras no uses rewrites a Cloud Run o Functions.

## 3. Generar la clave JSON

Dentro de la service account:

1. Entra a `Keys`
2. Crea una nueva clave
3. Tipo `JSON`
4. Descarga el archivo

## 4. Cargar el secreto en GitHub

En el repositorio, abre:

- `Settings -> Secrets and variables -> Actions`

Crea este secret:

- `FIREBASE_SERVICE_ACCOUNT`

Su valor debe ser el contenido completo del JSON descargado.

## 5. Cargar las variables de entorno

En la misma seccion, pero en `Variables`, crea:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Puedes copiar los valores desde tu `.env` local.

## 6. Activar el flujo

Una vez cargados el secret y las variables:

- cualquier PR disparara `deploy-preview.yml`
- cualquier push a `main` disparara `deploy-live.yml`

## 7. Verificacion rapida

Antes de hacer merge a `main`, valida:

1. El workflow de PR termina en verde
2. El comentario del PR incluye una preview URL de Firebase Hosting
3. El deploy live apunta al proyecto `runtimer-b1688`

## 8. Checklist minimo para dejarlo funcionando

1. Crear la service account
2. Asignar `Firebase Hosting Admin`, `Firebase Authentication Admin` y `API Keys Viewer`
3. Subir el JSON a GitHub como `FIREBASE_SERVICE_ACCOUNT`
4. Crear las variables `VITE_FIREBASE_*`
5. Subir una rama y abrir un PR
6. Confirmar que se publica la preview URL
7. Hacer merge a `main`
8. Confirmar que el sitio live queda desplegado
## 9. Cuotas y plan gratuito

Firebase Hosting tiene cuota gratuita y el sitio puede desplegarse sin Cloud Run ni Functions.

Las cuotas y limites pueden cambiar, asi que revisa la documentacion oficial de Hosting y planes de Firebase antes de abrir el sitio a trafico real:

- Hosting quotas y pricing: https://firebase.google.com/docs/hosting/usage-quotas-pricing
- Firebase pricing plans: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans

## Referencias oficiales

- Firebase Hosting GitHub integration: https://firebase.google.com/docs/hosting/github-integration
- Action oficial: https://github.com/FirebaseExtended/action-hosting-deploy
- Guia de service account de la accion: https://github.com/FirebaseExtended/action-hosting-deploy/blob/main/docs/service-account.md
