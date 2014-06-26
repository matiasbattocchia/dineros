var dp = $('#fecha').datepicker({
  format: 'yyyy/mm/dd',
  language: 'es',
  autoclose: true,
  weekStart: 1,
  keyboardNavigation: false,
  todayHighlight: true
});

// dp.datepicker('setDate', $('input[type=hidden]').val());

// dp.on('changeDate', function(e){
//   $('input[type=hidden]').val(e.date)
// });

añadirOpción = function( selector, opción ) {
  selector.append( new Option( opción.nombre, opción.id ) );
  selector.prop( 'selectedIndex', -1 );
  // TODO: Ordenar las opciones alfabéticamente.
}

quitarOpción = function( selector, opción ) {
  selector.children( 'option[value=' + opción.id + ']' ).remove();
  selector.prop( 'selectedIndex', -1 );
};

añadirÍtem = function( repetible, ítem ) {
  repetido = repetible.clone();

  repetido.removeClass( 'repetible' );
  repetido.find( 'select' ).val( ítem.id );
  repetido.find( 'select' ).prop( 'disabled', true );
  repetido.find( 'input' ).val( ítem.monto );
  repetido.find( 'input' ).prop( 'disabled', false );
  repetido.find( 'a' ).removeClass( 'disabled' );

  repetido.insertBefore( repetible );
  repetible.find( 'input' ).prop( 'disabled', true );

  quitarOpción( repetible.find( 'select' ), ítem );
}

quitarÍtem = function( repetible, ítem ) {
  repetible.siblings().has( 'select option:selected[value=' + ítem.id + ']' ).remove();
  añadirOpción( repetible.find( 'select' ), ítem );
}

repetible = $( '.repetible' );

$( document ).ready( function() {
  usuarios = $( '.data' ).data( 'ítems' );

  $.each( usuarios, function( index, usuario ) {
    añadirOpción( repetible.find( 'select' ), usuario );

    if( usuario.monto ) {
      añadirÍtem( repetible, usuario );
    }
  });
});


// Habilita el input del monto una vez seleccionado el pagador.
repetible.find( 'select' ).change( function() {
  if( $( this ).val() ) {
    repetible.find( 'input' ).prop( 'disabled', false );
  }
});

// Agrega un usuario cuando se sale del foco del selector.
repetible.find( 'select' ).focusout( function() {
  if( $( this ).val() ) {
    usuario = { id: $( this ).val() };
    añadirÍtem( repetible, usuario );
    repetible.prev().find( 'input' ).focus();
  }
});

// Remueve un usuario cuando el botón de remover es apretado.
repetible.parent().on( 'click', 'a', function() {
  usuario = $( this ).closest( '.row' ).find( 'select' ).children( ':selected' );
  usuario = { id: usuario.val(), nombre: usuario.text() }
  quitarÍtem( repetible, usuario );
});

// Formetea el monto y suma el total cuando el input cambia.
repetible.parent().on( 'keyup', 'input[name="pagadores[][monto]"]', function() {
  $( this ).val( $( this ).val().replace('.',',') );

  $( 'input[name=total]' ).val( function() {
    var sum = 0;
    $( 'input[name="pagadores[][monto]"]' ).each( function() {
      sum += Number( $( this ).val().replace(',','.') );
    });
    return String( sum.toFixed(2) ).replace('.',',');
  });
});

// Habilita los selects para incluirlos en el formulario al enviarlo.
repetible.closest( 'form' ).submit( function() {
  $( 'select:disabled' ).prop( 'disabled', false );
});

// Principal

$( 'tr' ).click( function() {
  window.location = $( this ).data( 'href' );
});
