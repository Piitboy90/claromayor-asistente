// ============================================
// CLAROMAYOR - Frontend JavaScript
// ============================================
// Esta app permite a personas mayores hacer 
// preguntas sobre lenguaje oficial y recibir 
// respuestas claras.
// ============================================

// ============================================
// CONFIGURACIÓN
// ============================================
// La URL de la Edge Function que creamos en Supabase

const SUPABASE_URL = "https://cgyroimzmhlrgnfimwen.supabase.co";
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/claromayor-asistente`;

// ============================================
// REFERENCIAS A ELEMENTOS DEL HTML
// ============================================
// Capturamos los elementos del HTML para poder 
// modificarlos desde JavaScript.

const campoPregunta = document.getElementById("pregunta");
const botonPreguntar = document.getElementById("boton-preguntar");
const botonNuevaPregunta = document.getElementById("boton-nueva-pregunta");
const seccionRespuesta = document.getElementById("seccion-respuesta");
const respuestaTexto = document.getElementById("respuesta");
const cargando = document.getElementById("cargando");
const error = document.getElementById("error");

// ============================================
// EVENT LISTENERS - Escuchar acciones del usuario
// ============================================

// Cuando hacen clic en "PREGUNTAR"
botonPreguntar.addEventListener("click", enviarPregunta);

// Cuando hacen clic en "Hacer otra pregunta"
botonNuevaPregunta.addEventListener("click", reiniciarApp);

// EXTRA: También se puede enviar pulsando Ctrl+Enter
campoPregunta.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    enviarPregunta();
  }
});

// ============================================
// FUNCIÓN PRINCIPAL - ENVIAR PREGUNTA
// ============================================

async function enviarPregunta() {
  
  // Paso 1: Obtener y limpiar la pregunta del usuario
  const pregunta = campoPregunta.value.trim();
  
  // Paso 2: Validar que hay una pregunta
  if (!pregunta) {
    mostrarError("⚠️ Por favor, escriba su pregunta antes de pulsar el botón.");
    return;
  }
  
  // Paso 3: Validar longitud mínima (no aceptamos preguntas absurdamente cortas)
  if (pregunta.length < 3) {
    mostrarError("⚠️ Por favor, escriba una pregunta más completa.");
    return;
  }
  
  // Paso 4: Validar longitud máxima
  if (pregunta.length > 500) {
    mostrarError("⚠️ Su pregunta es muy larga. Por favor, sea más breve.");
    return;
  }
  
  // Paso 5: Limpiar la interfaz de mensajes anteriores
  ocultarError();
  ocultarRespuesta();
  
  // Paso 6: Mostrar mensaje de "cargando"
  mostrarCargando();
  
  // Paso 7: Deshabilitar el botón mientras se procesa
  botonPreguntar.disabled = true;
  botonPreguntar.textContent = "⏳ ESPERE...";
  
  try {
    // ============================================
    // LLAMADA A LA EDGE FUNCTION
    // ============================================
    
    console.log("📤 Enviando pregunta:", pregunta);
    
    const respuesta = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pregunta: pregunta  // IMPORTANTE: el campo se llama "pregunta"
      })
    });
    
    // ============================================
    // VERIFICAR RESPUESTA
    // ============================================
    
    if (!respuesta.ok) {
      // Si hay error, intentar leer el mensaje
      let mensajeError = "Lo siento, ha habido un problema.";
      
      try {
        const datosError = await respuesta.json();
        mensajeError = datosError.error || mensajeError;
      } catch (e) {
        mensajeError = `Error del servidor: ${respuesta.status}`;
      }
      
      throw new Error(mensajeError);
    }
    
    // ============================================
    // PROCESAR RESPUESTA EXITOSA
    // ============================================
    
    const datos = await respuesta.json();
    
    // Validar que la respuesta tiene el campo esperado
    if (!datos.respuesta) {
      throw new Error("La respuesta no tiene el formato esperado.");
    }
    
    console.log("✅ Respuesta recibida:", datos.respuesta);
    
    // Mostrar la respuesta al usuario
    mostrarRespuesta(datos.respuesta);
    
  } catch (err) {
    // ============================================
    // MANEJO DE ERRORES (cálido y claro)
    // ============================================
    
    console.error("❌ Error:", err);
    mostrarError(`❌ ${err.message}`);
    
  } finally {
    // ============================================
    // SIEMPRE: Restaurar el botón al estado normal
    // ============================================
    
    ocultarCargando();
    botonPreguntar.disabled = false;
    botonPreguntar.textContent = "💬 PREGUNTAR";
  }
}

// ============================================
// FUNCIONES AUXILIARES - INTERFAZ
// ============================================

function mostrarRespuesta(texto) {
  respuestaTexto.textContent = texto;
  seccionRespuesta.style.display = "block";
  
  // Hacer scroll suave a la respuesta para que el mayor la vea
  seccionRespuesta.scrollIntoView({ 
    behavior: "smooth", 
    block: "start" 
  });
}

function ocultarRespuesta() {
  seccionRespuesta.style.display = "none";
  respuestaTexto.textContent = "";
}

function mostrarError(mensaje) {
  error.textContent = mensaje;
  error.style.display = "block";
}

function ocultarError() {
  error.style.display = "none";
  error.textContent = "";
}

function mostrarCargando() {
  cargando.style.display = "block";
}

function ocultarCargando() {
  cargando.style.display = "none";
}

// ============================================
// REINICIAR APP - Para hacer otra pregunta
// ============================================

function reiniciarApp() {
  // Limpiar el campo de pregunta
  campoPregunta.value = "";
  
  // Ocultar la respuesta anterior
  ocultarRespuesta();
  ocultarError();
  
  // Devolver el foco al campo de pregunta
  campoPregunta.focus();
  
  // Hacer scroll arriba para que vea el campo
  campoPregunta.scrollIntoView({ 
    behavior: "smooth", 
    block: "center" 
  });
}

// ============================================
// LOG DE INICIALIZACIÓN
// ============================================

console.log("🚀 ClaroMayor inicializado");
console.log("📍 Edge Function URL:", EDGE_FUNCTION_URL);
