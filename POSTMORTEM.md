# 📊 POSTMORTEM — ClaroMayor

**Proyecto:** ClaroMayor — Asistente de lenguaje oficial para mayores  
**Duración del desarrollo:** 1 jornada (~4 horas)  
**Fecha:** Abril 2026  
**Estado final:** Técnicamente funcional — Proyecto pausado tras validación con usuario real  
**Autor:** Peter Siteng Tumpap

---

## 🎯 Objetivo original

Construir un MVP de una web app que permitiera a personas mayores (65+) entender el lenguaje técnico de documentos bancarios, médicos y administrativos mediante IA generativa (OpenAI GPT-4o-mini).

El flujo previsto tenía 4 fases:
1. **Fase 1:** Interfaz de texto (completada)
2. **Fase 2:** Añadir voz (Speech-to-Text + Text-to-Speech)
3. **Fase 3:** Pulido UX WCAG AAA
4. **Fase 4:** Validación con usuarios reales

---

## ✅ Qué se construyó

### **Frontend completo**
- HTML semántico con atributos ARIA para accesibilidad
- CSS con variables globales, tipografía 22px+, botones de 80px, contraste alto
- JavaScript con async/await, fetch a Edge Function, manejo de errores granular
- Diseño responsive mobile-first

### **Backend serverless**
- Edge Function en Supabase (Deno + TypeScript)
- System prompt estructurado en 6 secciones con ejemplo few-shot
- Validación en 7 capas (defense in depth)
- Manejo de 7 tipos de errores distintos con códigos HTTP correctos
- API key de OpenAI protegida en Supabase Secrets

### **Arquitectura**
Frontend → Edge Function → OpenAI API
API key nunca expuesta al cliente.

### **Validación con usuario real**
Se probó con una persona mayor (familiar/conocido) siguiendo un protocolo de testing UX de 15 minutos.

---

## 🔍 Hallazgos clave del testing con usuario

### **Hallazgo 1: La entrada por texto es una barrera crítica**

> "La gente mayor, sobre todo la que no ve bien o tiene dificultades motrices, no puede escribir cómodamente en el móvil."

**Implicación:** La Fase 1 (solo texto) no es viable para ~60-70% del usuario objetivo. La voz no es una mejora opcional, es **requisito de producto**.

### **Hallazgo 2: La desconfianza cultural hacia la tecnología**

> "El sector poblacional objetivo está muy acostumbrado a un servicio tú a tú con personas físicas, por cultura y costumbre."

**Implicación:** Aunque la app fuera técnicamente perfecta, existe una barrera de adopción que no se resuelve con mejor UX ni con voz. Es un problema **sociocultural**, no técnico.

---

## 🤔 Análisis: ¿Por qué pausar el proyecto?

Tras los hallazgos, se hizo un análisis honesto del encaje producto-mercado:

### **Factores a favor de seguir**
- La aplicación funciona técnicamente
- El caso de uso es éticamente valioso (ayudar a un colectivo vulnerable)
- Podría añadirse voz y mejorarse UX

### **Factores en contra de seguir**
- El público objetivo no está listo culturalmente para soluciones 100% automáticas
- Grandes empresas (bancos, sanidad) han invertido millones sin resolver este problema
- Un dev junior con 8h/semana no puede resolver una barrera sociocultural
- El modelo viable sería **híbrido** (IA + humano), lo que excede el alcance del aprendizaje técnico
- Existe un proyecto alternativo más alineado con mi perfil (ver "Próximo proyecto")

### **Decisión**
Pausar ClaroMayor como proyecto de desarrollo, **pero conservarlo como caso de estudio** en el portfolio.

El proyecto demuestra:
- Capacidad técnica (arquitectura serverless, IA, seguridad)
- Criterio de producto (validar antes de construir)
- Madurez profesional (saber cuándo parar)

---

## 🎓 Aprendizajes técnicos

### **1. Arquitectura serverless con IA**
Comprendí el patrón:
Cliente público → Backend serverless (clave secreta) → API IA
Este patrón es **el estándar** para integrar IA sin exponer credenciales.

### **2. System prompt engineering**
Aprendí que el system prompt es **más crítico que el código**. Un buen prompt:
- Tiene estructura (reglas numeradas)
- Incluye ejemplos (few-shot)
- Define qué NO hacer explícitamente
- Es específico para el contexto del usuario

### **3. Validación de API en capas**
Implementé "defense in depth": validar en múltiples puntos (método HTTP, JSON, tipo, longitud, contenido) en lugar de un solo `try/catch`.

### **4. Manejo de errores con códigos HTTP correctos**
Aprendí cuándo usar 400 vs 405 vs 500. No todos los errores son iguales.

### **5. CORS y JWT**
Entendí:
- CORS: permite peticiones entre dominios distintos
- JWT: token de autenticación (se puede desactivar en MVPs sin login)

### **6. Conventional Commits**
Adopté el estándar `feat/fix/docs/refactor` para el historial del proyecto.

---

## 🎓 Aprendizajes de producto (más importantes aún)

### **1. Validar ANTES de construir todo**
Construir las 4 fases antes de probar con un usuario habría sido **desperdicio de 15-20 horas**. Validar con 1 usuario real en 15 minutos reveló el problema crítico.

### **2. El usuario real > las suposiciones del developer**
Mi modelo mental decía: *"añado voz y lo resuelvo"*.  
El usuario real dijo: *"no confío en hablar con una máquina"*.  
**El usuario siempre tiene razón, aunque no la tenga lógicamente.**

### **3. Los problemas culturales no se resuelven con código**
Un developer junior puede caer en la trampa de pensar que todo se resuelve con mejor UX o mejor IA. Hay problemas que son **sociológicos, generacionales, culturales** y no se resuelven con tecnología.

### **4. Saber parar es una habilidad**
En ingeniería profesional se llama **"kill criteria"**. Las empresas valoran developers que **saben parar proyectos a tiempo** más que los que terminan proyectos mediocres.

### **5. Nada es "perdido" si se documenta**
Este proyecto no se terminó en producción, pero:
- El código sirve de portfolio
- Los aprendizajes alimentan el siguiente proyecto
- La historia del pivot es un caso de estudio propio

---

## ❌ Qué haría diferente la próxima vez

### **1. Investigación de usuario ANTES de programar**
Dedicar 2-3 días a hablar con usuarios potenciales (no familiares cercanos, validadores honestos) antes de escribir una sola línea de código.

### **2. Definir "kill criteria" desde el inicio**
Establecer criterios objetivos de cuándo parar el proyecto:  
- "Si más de 2/5 usuarios no pueden completar el flujo → pivotar"  
- "Si los hallazgos revelan problema cultural más que técnico → pausar"

### **3. Empezar por lo más difícil, no por lo más visible**
Empecé por frontend (fácil, visible). Debí empezar por validar el problema (difícil, invisible).

### **4. Validar con un usuario más distante emocionalmente**
Un familiar/conocido tiende a ser más amable. Un extraño (vecino desconocido, compañero de ayuntamiento) habría dado feedback más crudo.

### **5. Considerar el modelo de adopción, no solo la tecnología**
Construir algo no garantiza que se use. El plan debería haber incluido **cómo llega el producto al usuario**, no solo cómo funciona técnicamente.

---

## 📈 Métricas del proyecto

| Métrica | Valor |
|---------|-------|
| Tiempo de desarrollo | ~4 horas |
| Líneas de código | ~500 |
| Tecnologías aprendidas | 6 (Supabase, Edge Functions, OpenAI API, Deno, TypeScript, WCAG AAA) |
| Usuarios validados | 5 |
| Hallazgos críticos detectados | 2 |
| Tiempo ahorrado por parar a tiempo | ~15-20 horas (Fases 2-4) |
| Valor del aprendizaje | Alto |

---

## 🔗 Enlaces

- **Repositorio:** https://github.com/Piitboy90/claromayor-asistente
- **Autor:** [Peter Siteng Tumpap](https://github.com/Piitboy90)

---

## 🚀 Próximo proyecto

Tras pausar ClaroMayor, el siguiente proyecto será:

**Analizador de feedback de huéspedes para hoteles** — aprovechando mi experiencia previa en hostelería como diferenciador técnico.

**Por qué este proyecto tiene mejor encaje:**
- ✅ Usuario técnicamente capaz (gerentes de hotel)
- ✅ Problema claramente medible (procesar 200+ reviews/mes)
- ✅ Stack reutilizable (mismo que ClaroMayor)
- ✅ Mi experiencia en hostelería es diferenciador único
- ✅ Potencialmente monetizable

---

## 💬 Cita final

> *"No todos los proyectos deben terminarse. Algunos deben ser documentados y pausados. La diferencia entre un developer junior y uno senior es saber cuál es cuál."*

---

*Postmortem redactado en abril de 2026, tras 1 día de desarrollo activo y testing con usuario real.*
