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

$( 'form[action="/gastos"]' ).on( 'typeahead:selected', '.typeahead', function(object, datum, name) {
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
    repetido.find( 'input.typeahead' ).typeahead( 'val', usuario.nombre );
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

  if( pagadores.length > 0 ) {
    $.each( pagadores, function( index, pagador ) {
      agregarRepetible( $( '.repetible.pagador' ), pagador, 'monto' );
    });
  } else {
    agregarRepetible( $( '.repetible.pagador' ) );
  }

  if( gastadores.length > 0 ) {
    $.each( gastadores, function( index, gastador ) {
      agregarRepetible( $( '.repetible.gastador' ), gastador, 'proporción' );

      if( gastador.proporción != 1 ) { proporciónDesigual = true; }
    });
  } else {
    agregarRepetible( $( '.repetible.gastador' ) );
  }

  if( proporciónDesigual ) {
    $( 'input[type=checkbox]' ).prop( 'checked', true );
    $( 'input[type=checkbox]' ).parent().addClass( 'active' );
  } else {
    $( '.proporción' ).hide();
  }

  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
  $( 'input[name="gasto[concepto]"]' ).focus();
});

// Remueve un usuario cuando el botón de remover es apretado.
$( 'form[action="/gastos"]' ).on( 'click', '.borrar', function() {
  var repetido = $( this ).closest( '.row' );
  var próximo = repetido.next();
  repetido.remove();

  if( !( próximo.find( '.typeahead' ).focus() === 0 ) ) {
    próximo.find( '.agregar' ).focus();
  }

  // Repite el cálculo del gasto total cuando un pagador es retirado.
  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
});

// Formatea el monto y suma el total cuando el input cambia.
$( 'form[action="/gastos"]' ).parent().on( 'keyup', 'input[name="pagadores[][monto]"]', function() {
  $( this ).val( $( this ).val().replace('.',',') );
  calcularTotal( $( 'input[name="pagadores[][monto]"]' ), $( 'input[name=total]' ) );
});

// Remueve los repetibles, que son campos no visibles, al enviar el formulario.
$( 'form[action="/gastos"]' ).submit( function() {
  $( '.repetible' ).remove();
});

// Gasto desigual.
$( 'form[action="/gastos"] input[type=checkbox]' ).change( function() {
  if( $( this ).is( ':checked' ) ) {
    $( '.proporción' ).show();
  } else {
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
