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

// añadirÍtem = function( repetible, ítem, atributo ) {
//   repetido = repetible.clone();

//   repetido.removeClass( 'repetible' );
//   repetido.find( 'select' ).val( ítem.id );
//   repetido.find( 'select' ).prop( 'disabled', true );
//   repetido.find( 'input' ).val( ítem[atributo] );
//   repetido.find( 'input' ).prop( 'disabled', false );
//   repetido.find( 'a' ).removeClass( 'disabled' );

//   repetido.insertBefore( repetible );
//   repetible.find( 'input' ).prop( 'disabled', true );

//   quitarOpción( repetible.find( 'select' ), ítem );
// }

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

$( 'form[action="/gastos"]' ).on( 'typeahead:autocompleted', '.typeahead', function(object, datum, name) {
  $( this ).closest( '.form-group' ).children( 'input[type=hidden]' ).val( datum.id );
  // $( this ).closest( '.form-group' ).addClass( 'has-success' );
});

agregarRepetible = function( repetible, usuario, atributo ) {
  repetido = repetible.clone();
  repetido.removeClass( 'repetible' );

  repetido.find( '.typeahead' ).typeahead({
    minLength: 0,
    highlight: true,
    hint: true,
  },
  {
    displayKey: 'nombre',
    source: engine.ttAdapter(),
  });

  repetido.insertBefore( repetible.siblings().last() );

  if( usuario ) {
    repetido.find( 'input[type=hidden]' ).val( usuario.id );
    repetido.find( 'input.typeahead' ).val( usuario.nombre );
    repetido.find( 'input.valor' ).val( usuario[atributo] );
  }

  return repetido;
}

var engine;

$( document ).ready( function() {

  engine = new Bloodhound({
    name: 'amigos',
    local: $( 'form[action="/gastos"]' ).data( 'amigos' ),
    datumTokenizer: Bloodhound.tokenizers.obj.whitespace( 'nombre' ),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
  });

  engine.initialize();

  amigos = $( 'form[action="/gastos"]' ).data( 'amigos' );
  pagadores = $( 'form[action="/gastos"]' ).data( 'pagadores' );
  gastadores = $( 'form[action="/gastos"]' ).data( 'gastadores' );

  proporciónDesigual = false;

  // $.each( amigos, function( index, usuario ) {
  //   añadirOpción( $( '.repetible select' ), usuario );
  // });

  if( pagadores.length > 0 ) {
    $.each( pagadores, function( index, usuario ) {
      agregarRepetible( $( '.repetible.pagador' ), usuario, 'monto' );
    });
  } else {
    agregarRepetible( $( '.repetible.pagador' ) );
  }

  if( gastadores.length > 0 ) {
    $.each( gastadores, function( index, usuario ) {
      agregarRepetible( $( '.repetible.gastador' ), usuario, 'proporción' );

      if( usuario.proporción != 1 ) { proporciónDesigual = true; }
    });
  } else {
    agregarRepetible( $( '.repetible.gastador' ) );
  }

  if( proporciónDesigual ) {
    // $( 'input[type=checkbox]' ).prop( 'checked', true );
    $( 'input[type=checkbox]' ).parent().addClass( 'active' );
  } else {
    // $( '.gastador:not(.repetible) .proporción input' ).prop( 'disabled', true );
    $( '.proporción' ).hide();
  }

  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );

  $( 'input[name="gasto[concepto]"]' ).focus();
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
    usuario = { id: $( this ).val() };

    if( $( this ).closest( '.repetible' ).hasClass( 'pagador' ) ) {
      añadirÍtem( $( this ).closest( '.repetible' ), usuario, 'monto' );
    } else {
      añadirÍtem( $( this ).closest( '.repetible' ), usuario, 'proporción' );
    }

    // Oculta el selector cuando no quedan opciones.
    if( $( this ).find( 'option' ).length == 0 ) {
      $( this ).closest( '.repetible' ).hide();
    }

    // Comúnmente quienes pagan también gastan. Esto agrega al usuario
    // como gastador automáticamente.
    // if( $( this ).closest( '.repetible' ).hasClass( 'pagador' ) ) {
    //   añadirÍtem( $( '.repetible.gastador' ), usuario );
    // }

    $( this ).closest( '.repetible' ).prev().find( 'input' ).focus();
  }
});

// Remueve un usuario cuando el botón de remover es apretado.
$( 'form[action="/gastos"]' ).on( 'click', '.borrar', function() {
  // usuario = $( this ).closest( '.row' ).find( 'select' ).children( ':selected' );
  // usuario = { id: usuario.val(), nombre: usuario.text() }

  $( this ).closest( '.row' ).remove();

  // quitarÍtem( $( this ).closest( '.row' ).siblings( '.repetible' ), usuario );

  // Repite el cálculo del gasto total cuando un pagador es retirado.
  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );

  // Al quitar un repetido siempre vuelve a haber al menos un usuario para elegir.
  // repetible.show();
});

// Formatea el monto y suma el total cuando el input cambia.
$( '.repetible' ).parent().on( 'keyup', 'input[name="pagadores[][monto]"]', function() {
  $( this ).val( $( this ).val().replace('.',',') );

  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
});

// Habilita los selects para incluirlos en el formulario al enviarlo.
$( 'form[action="/gastos"]' ).submit( function() {
  // $( 'select:disabled' ).prop( 'disabled', false );
  $( '.repetible' ).remove();
});

// Gasto desigual.
$( 'form[action="/gastos"] input[type=checkbox]' ).change( function() {
  if( $( this ).is( ':checked' ) ) {
    $( '.proporción' ).show();
    // $( '.gastador:not(.repetible) .proporción input' ).prop( 'disabled', false );
  } else {
    // $( '.gastador:not(.repetible) .proporción input' ).prop( 'disabled', true );
    $( '.proporción' ).hide();
  }
});

// Eventos

$( '.agregar' ).click( function() {
  agregarRepetible( $( this ).closest( '.row' ).siblings( '.repetible' ) ).find( '.typeahead' ).focus();
});

// Principal

$( 'tbody > tr' ).click( function() {
  window.location = $( this ).data( 'href' );
});
