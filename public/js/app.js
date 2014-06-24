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

  repetido.find( 'select' ).val( ítem.id );
  repetido.find( 'select' ).prop( 'disabled', true );
  repetido.find( 'input' ).val( ítem.monto );
  repetido.find( 'a' ).removeClass( 'disabled' );

  repetido.insertBefore( repetible.parent() );

  quitarOpción( repetible.find( 'select' ), ítem );
}

quitarÍtem = function( repetible, ítem ) {
  repetible.parent().siblings( '.row' ).has( 'select option:selected[value=' + ítem.id + ']' ).remove();
  añadirOpción( repetible.find( 'select' ), ítem );
}

repetible = $( '.repetible > .row' );

$( document ).ready( function() {
  usuarios = $( '.repetible' ).data( 'ítems' );
  
  $.each( usuarios, function( index, usuario ) {
    añadirOpción( repetible.find( 'select' ), usuario );

    if( usuario.monto ) {
      añadirÍtem( repetible, usuario );
    }
  });
});

// Agrega un usuario cuando se sale del foco del selector.
repetible.find( 'select' ).focusout( function() {
  if( $( this ).val() ) {
    usuario = { id: $( this ).val() };
    añadirÍtem( repetible, usuario );
    repetible.parent().prev().find( 'input' ).focus();
  }
});

// Remueve un usuario cuando el botón de remover es apretado.
$( '.repetible' ).parent().on( 'click', 'a', function() {
  usuario = $( this ).closest( '.row' ).find( 'select' ).children( ':selected' );
  usuario = { id: usuario.val(), nombre: usuario.text() }
  quitarÍtem( repetible, usuario );
});

// Formetea el monto y suma el total cuando el input cambia.
$( '.repetible' ).parent().on( 'change', 'input[name="pagadores[][monto]"]', function() {
  // $( this ).val( $( this ).val().replace('.',',') );
		
    // function() {
    // var sum = 0;
    // $('#pagadores input:enabled').each( function() {
    //   sum += Number($(this).val().replace(',','.'));
    // });
    // return String(sum.toFixed(2)).replace('.',',');
  // });
});


// Principal

$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
