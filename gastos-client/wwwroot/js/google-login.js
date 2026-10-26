// const GOOGLE_CLIENT_ID =
//   "582606738848-5pv7m17an0s4gj7d0com3h29nagcuj2f.apps.googleusercontent.com";

// window.gastosGoogle = {

//   idToken: null,
//   email: null,

//   restaurarSesion: function () {
//     const token = localStorage.getItem("gastosGoogleIdToken");

//     if (!token) return false;

//     try {
//       const payload = JSON.parse(
//         atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
//       );

//       // No restaurar tokens vencidos
//       if (!payload.exp || payload.exp * 1000 <= Date.now()) {
//         localStorage.removeItem("gastosGoogleIdToken");
//         return false;
//       }

//       this.idToken = token;

//       // Restaurar la interfaz de usuario
//       document.getElementById("google-button").style.display = "none";
//       document.getElementById("gastos-panel").style.display = "block";
//       document.getElementById("logout-button").style.display = "inline-block";

//       const status = document.getElementById("login-status");
//       if (status) {
//         status.textContent = "Sesión restaurada";
//       }

//       return true;
//     } catch {
//       localStorage.removeItem("gastosGoogleIdToken");
//       return false;
//     }
//   },


//   inicializar: function () {
//     this.restaurarSesion();
//     const contenedor = document.getElementById("google-button");

//     if (!contenedor) return;

//     if (!window.google?.accounts?.id) {
//       document.getElementById("login-status").textContent =
//         "No se pudo cargar el inicio de sesión de Google. Recarga la página.";
//       return;
//     }

//     google.accounts.id.initialize({
//       client_id: GOOGLE_CLIENT_ID,
//       callback: function (response) {
//         if (!response.credential) {
//           document.getElementById("login-status").textContent =
//             "Google no devolvió un token.";
//           return;
//         }

//         // El token se mantiene solo en memoria, no en localStorage.
//         window.gastosGoogle.idToken = response.credential;

//         // Ahora si se Guarda
//         localStorage.setItem(
//           "gastosGoogleIdToken",
//           response.credential
//         );

//         // Decodificamos el correo solo para mostrarlo en pantalla.
//         // La autorización real la debe comprobar el backend.
//         try {
//           const payload = response.credential.split(".")[1];
//           const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
//           const datos = JSON.parse(
//             decodeURIComponent(
//               Array.from(atob(base64), c =>
//                 "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
//               ).join("")
//             )
//           );

//           window.gastosGoogle.email = datos.email || null;
//         } catch {
//           window.gastosGoogle.email = null;
//         }

//         document.getElementById("login-status").textContent =
//           window.gastosGoogle.email
//             ? "Sesión iniciada: " + window.gastosGoogle.email
//             : "Sesión iniciada con Google.";

//         document.getElementById("google-button").style.display = "none";
//         document.getElementById("logout-button").style.display = "inline-block";
//         document.getElementById("gastos-panel").style.display = "block";
//       }
//     });

//     google.accounts.id.renderButton(contenedor, {
//       type: "standard",
//       theme: "outline",
//       size: "large",
//       text: "signin_with",
//       shape: "rectangular",
//       width: 280
//     });
//   },

//   cerrarSesion: function () {
//     window.gastosGoogle.idToken = null;
//     window.gastosGoogle.email = null;

//     if (window.google?.accounts?.id) {
//       google.accounts.id.disableAutoSelect();
//     }

//     document.getElementById("login-status").textContent =
//       "Has cerrado sesión.";

//     document.getElementById("google-button").style.display = "block";
//     document.getElementById("logout-button").style.display = "none";
//     document.getElementById("gastos-panel").style.display = "none";

//     // Eliminar el token de sesión
//     localStorage.removeItem("gastosGoogleIdToken");
//     this.idToken = null;
//   }

// };


const GOOGLE_CLIENT_ID =
  "582606738848-5pv7m17an0s4gj7d0com3h29nagcuj2f.apps.googleusercontent.com";

window.gastosGoogle = {
  idToken: null,
  email: null,

  // Decodifica el contenido del token
  decodificarToken: function (token) {
    const parte = token.split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const base64 = parte + "=".repeat((4 - parte.length % 4) % 4);

    return JSON.parse(
      decodeURIComponent(
        Array.from(atob(base64), c =>
          "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
        ).join("")
      )
    );
  },

  // Actualiza la interfaz después de iniciar sesión
  mostrarSesion: function (token, email) {
    this.idToken = token;
    this.email = email || null;

    document.getElementById("google-button").style.display = "none";
    document.getElementById("gastos-panel").style.display = "block";
    document.getElementById("logout-button").style.display = "inline-block";

    const status = document.getElementById("login-status");
    if (status) {
      status.textContent = email
        ? "Sesión iniciada: " + email
        : "Sesión iniciada con Google.";
    }
  },

  // Recupera la sesión si el token aún es válido
  restaurarSesion: function () {
    const token = localStorage.getItem("gastosGoogleIdToken");

    if (!token) return false;

    try {
      const datos = this.decodificarToken(token);

      if (!datos.exp || datos.exp * 1000 <= Date.now()) {
        localStorage.removeItem("gastosGoogleIdToken");
        this.idToken = null;
        this.email = null;
        return false;
      }

      this.mostrarSesion(token, datos.email);
      return true;
    } catch {
      localStorage.removeItem("gastosGoogleIdToken");
      this.idToken = null;
      this.email = null;
      return false;
    }
  },

  inicializar: function () {
    const contenedor = document.getElementById("google-button");
    const status = document.getElementById("login-status");

    if (!contenedor) return;

    if (!window.google?.accounts?.id) {
      if (status) {
        status.textContent =
          "No se pudo cargar Google. Recarga la página.";
      }
      return;
    }

    // Configurar Google incluso si ya tenemos un token guardado
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: true,

      callback: (response) => {
        if (!response.credential) {
          if (status) {
            status.textContent = "Google no devolvió un token.";
          }
          return;
        }

        try {
          const datos = this.decodificarToken(response.credential);

          // Guardar el token y recuperar la cuenta
          localStorage.setItem(
            "gastosGoogleIdToken",
            response.credential
          );

          this.mostrarSesion(
            response.credential,
            datos.email
          );
        } catch {
          if (status) {
            status.textContent =
              "No se pudo procesar la respuesta de Google.";
          }
        }
      }
    });

    // Si la sesión sigue vigente, no es necesario iniciar sesión otra vez
    if (this.restaurarSesion()) return;

    // Si no hay sesión válida, mostrar el botón de Google
    contenedor.style.display = "block";
    document.getElementById("gastos-panel").style.display = "none";
    document.getElementById("logout-button").style.display = "none";

    google.accounts.id.renderButton(contenedor, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: 280
    });

    // Intentar recuperar la cuenta automáticamente
    google.accounts.id.prompt();
  },

  cerrarSesion: function () {
    this.idToken = null;
    this.email = null;

    localStorage.removeItem("gastosGoogleIdToken");

    if (window.google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }

    document.getElementById("login-status").textContent =
      "Has cerrado sesión.";

    document.getElementById("google-button").style.display = "block";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("gastos-panel").style.display = "none";
  }
};

