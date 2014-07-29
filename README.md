# Dineros

**Dineros** sirve para llevar las cuentas entre amigos. Básicamente permite ingresos del tipo:

* Fecha: 22 de julio de 2014
* Concepto: Pizza
* Pagaron: Alfo ($100), Beto ($70)
* Gastaron: Alfo, Beto, Gammo, Delto

El ejemplo no lo muestra, pero la participación en el gasto puede ser desigual. La aplicación va calculando cuánto los amigos se deben entre sí a medida que se van produciendo gastos comunes. Cada usuario tiene una cuenta y en ella configura a quienes puede prestarles y hasta cuanto.

### TODO

**General**
* Validaciones: marcar en el formulario los campos con inválidos junto con los mensajes de error.
* Validaciones: reescribir correctamente la URL en la validación (actualmente usa la del POST).
* Al enviar usuarios por JSON filtrar campos sensibles (contraseña, sal).
* **editar_gasto.slim** — Filtrar campos en blanco del formulario enviado.
* **editar_gasto.slim** — Filtrar de las sugerencias las palabras ya utilizadas para evitar que el mismo usuario pueda aparecer múltiples veces como pagador/gastador.
* **editar_gasto.slim** — De existir, quitar el id de usuario del campo oculto asociado al typeahead al modificar el nombre de usuario si este no se encuentra dentro de las sugerencias.
* **post '/gastos'** — Actualizar el registro en vez de eliminarlo y volverlo a crear.

**Mongoid**
* Reportar bug: validaciones y valores por defecto. La validación (aún con ´allow_nil: true´) evita la asignación del valor por defecto.

**Bootstrap-Datepicker.js**
* Reportar bug: al seleccionar una fecha con el puntero se pierde el foco en el formulario; debería quedar enfocado el campo de la fecha.
* Reportar bug: la primera vez que se abre el selector, cargada la página, se abre desalineado respecto al campo de fecha; no así en las aperturas sucesivas.

**Typeahead.js**
* Mostrar todas las sugerencias al activarse el campo, siempre y cuando este esté vacio (funcionalidad combobox); esta funcionalidad ya está pedida desde hace meses, se la puede esperar o bien implementar una solución propia.
* CSS: scroll vertical en el menú de sugerencias cuando estas son muchas (overflow).
* Reportar bug: el evento de autocompletado debería lanzarse aun al escribir la palabra sin ayuda, o al menos debería haber un evento que indique que la palabra que se escribió pertenece al conjunto de palabras autocompletables.

**Bootstrap**
* **button.js** — Reportar bug: aunque es posible enfocarse sobre un botón, carece del efecto visual que poseen los botones comunes.
