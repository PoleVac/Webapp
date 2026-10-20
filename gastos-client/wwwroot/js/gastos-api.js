
const GASTOS_API_URL =
  "https://script.google.com/macros/s/AKfycbyFFszv3HHC_z4Z9c37D5kHM-sn-t9AWXngnxh-J754nBKWSwSYGvtcKhU3gpGhdlpiTw/exec";

window.gastosApi = {
  async solicitar(action, gasto = null) {
    const idToken = window.gastosGoogle?.idToken;

    if (!idToken) {
      throw new Error("Inicia sesión con Google primero.");
    }

    const body = { idToken, action };

    if (gasto !== null) {
      body.gasto = gasto;
    }

    const response = await fetch(GASTOS_API_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error("Error HTTP: " + response.status);
    }

    const resultado = await response.json();

    if (!resultado.ok) {
      throw new Error(resultado.error || "Error al consultar la API.");
    }

    return resultado;
  },

  listar() {
    return this.solicitar("listar");
  },

  agregar(gasto) {
    return this.solicitar("agregar", gasto);
  }
};
