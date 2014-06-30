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

añadirÍtem = function( repetible, ítem, atributo ) {
  repetido = repetible.clone();

  repetido.removeClass( 'repetible' );
  repetido.find( 'select' ).val( ítem.id );
  repetido.find( 'select' ).prop( 'disabled', true );
  repetido.find( 'input' ).val( ítem[atributo] );
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

calcularTotal = function( fuentes, objetivo ) {
  objetivo.val( function() {
    var sum = 0;
    fuentes.each( function() {
      sum += Number( $( this ).val().replace(',','.') );
    });
    return String( sum.toFixed(2) ).replace('.',',');
  });
};

$( document ).ready( function() {
  usuarios = $( 'form' ).data( 'usuarios' );

  $.each( usuarios, function( index, usuario ) {
    añadirOpción( $( '.repetible select' ), usuario );

    if( usuario.monto ) {
      añadirÍtem( $( '.repetible.pagador' ), usuario, 'monto' );
    }

    if( usuario.proporción ) {
      añadirÍtem( $( '.repetible.gastador' ), usuario, 'proporción' );
    }
  });

  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
});


// Habilita el input del monto/de la participación una vez
// seleccionado el pagador/gastador.
$( '.repetible select' ).change( function() {
  if( $( this ).val() ) {
    $( this ).closest( '.repetible' ).find( 'input' ).prop( 'disabled', false );
  }
});

// Agrega un usuario cuando se sale del foco del selector.
$( '.repetible select' ).focusout( function() {
  if( $( this ).val() ) {
    // Acá se definen los valores por defecto de los repetidos.
    // En la vista se definen los valores por defecto de los repetibles.
    usuario = { id: $( this ).val(), proporción: 1 };

    if( $( this ).closest( '.repetible' ).hasClass( 'pagador' ) ) {
      añadirÍtem( $( this ).closest( '.repetible' ), usuario, 'monto' );
    } else {
      añadirÍtem( $( this ).closest( '.repetible' ), usuario, 'proporción' );
    }

    // Oculta el selector cuando no quedan opciones.
    if( $( this ).find( 'option' ).length == 0 ) {
      $( this ).closest( '.repetible' ).hide();
    }

    // if( $( this ).closest( '.repetible' ).hasClass( 'pagador' ) ) {
    //   añadirÍtem( $( '.repetible.gastador' ), usuario );
    // }

    $( this ).closest( '.repetible' ).prev().find( 'input' ).focus();
  }
});

// Remueve un usuario cuando el botón de remover es apretado.
$( '.repetible' ).parent().on( 'click', 'a', function() {
  usuario = $( this ).closest( '.row' ).find( 'select' ).children( ':selected' );
  usuario = { id: usuario.val(), nombre: usuario.text() }

  var repetible = $( this ).closest( '.row' ).siblings( '.repetible' );

  quitarÍtem( $( this ).closest( '.row' ).siblings( '.repetible' ), usuario );

  // Oculta el selector cuando no quedan opciones.
  if( repetible.find( 'option' ).length > 0 ) {
    repetible.show();
  }
});

// Formatea el monto y suma el total cuando el input cambia.
$( '.repetible' ).parent().on( 'keyup', 'input[name="pagadores[][monto]"]', function() {
  $( this ).val( $( this ).val().replace('.',',') );

  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
});

// Habilita los selects para incluirlos en el formulario al enviarlo.
$( 'form' ).submit( function() {
  $( 'select:disabled' ).prop( 'disabled', false );
});

// Principal

$( 'tr' ).click( function() {
  window.location = $( this ).data( 'href' );
});
