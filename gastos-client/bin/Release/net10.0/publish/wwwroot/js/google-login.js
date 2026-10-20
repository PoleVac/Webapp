
const GOOGLE_CLIENT_ID =
  "582606738848-5pv7m17an0s4gj7d0com3h29nagcuj2f.apps.googleusercontent.com";

window.gastosGoogle = {

  idToken: null,
  email: null,

  restaurarSesion: function () {
    const token = localStorage.getItem("gastosGoogleIdToken");

    if (!token) return false;

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );

      // No restaurar tokens vencidos
      if (!payload.exp || payload.exp * 1000 <= Date.now()) {
        localStorage.removeItem("gastosGoogleIdToken");
        return false;
      }

      this.idToken = token;

      // Restaurar la interfaz de usuario
      document.getElementById("google-button").style.display = "none";
      document.getElementById("gastos-panel").style.display = "block";
      document.getElementById("logout-button").style.display = "inline-block";

      const status = document.getElementById("login-status");
      if (status) {
        status.textContent = "Sesión restaurada";
      }

      return true;
    } catch {
      localStorage.removeItem("gastosGoogleIdToken");
      return false;
    }
  },


  inicializar: function () {
    this.restaurarSesion();
    const contenedor = document.getElementById("google-button");

    if (!contenedor) return;

    if (!window.google?.accounts?.id) {
      document.getElementById("login-status").textContent =
        "No se pudo cargar el inicio de sesión de Google. Recarga la página.";
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: function (response) {
        if (!response.credential) {
          document.getElementById("login-status").textContent =
            "Google no devolvió un token.";
          return;
        }

        // El token se mantiene solo en memoria, no en localStorage.
        window.gastosGoogle.idToken = response.credential;

        // Ahora si se Guarda
        localStorage.setItem(
          "gastosGoogleIdToken",
          response.credential
        );

        // Decodificamos el correo solo para mostrarlo en pantalla.
        // La autorización real la debe comprobar el backend.
        try {
          const payload = response.credential.split(".")[1];
          const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
          const datos = JSON.parse(
            decodeURIComponent(
              Array.from(atob(base64), c =>
                "%" + c.charCodeAt(0).toString(16).padStart(2, "0")
              ).join("")
            )
          );

          window.gastosGoogle.email = datos.email || null;
        } catch {
          window.gastosGoogle.email = null;
        }

        document.getElementById("login-status").textContent =
          window.gastosGoogle.email
            ? "Sesión iniciada: " + window.gastosGoogle.email
            : "Sesión iniciada con Google.";

        document.getElementById("google-button").style.display = "none";
        document.getElementById("logout-button").style.display = "inline-block";
        document.getElementById("gastos-panel").style.display = "block";
      }
    });

    google.accounts.id.renderButton(contenedor, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      width: 280
    });
  },

  cerrarSesion: function () {
    window.gastosGoogle.idToken = null;
    window.gastosGoogle.email = null;

    if (window.google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }

    document.getElementById("login-status").textContent =
      "Has cerrado sesión.";

    document.getElementById("google-button").style.display = "block";
    document.getElementById("logout-button").style.display = "none";
    document.getElementById("gastos-panel").style.display = "none";

    // Eliminar el token de sesión
    localStorage.removeItem("gastosGoogleIdToken");
    this.idToken = null;
  }

};
