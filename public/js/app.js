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


// $( '#pagadores' ).on('change', 'input:enabled', function() {
//   $('#pagadores input:disabled').val( function() {
//     var sum = 0;
//     $('#pagadores input:enabled').each( function() {
//       sum += Number($(this).val().replace(',','.'));
//     });
//     return String(sum.toFixed(2)).replace('.',',');
//   });
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

  var selector = repetido.find( 'select' );
  selector.val( ítem.id );
  selector.prop( 'disabled', true );

  repetido.find( 'input' ).val( ítem.monto );

  repetible.parent().before( repetido );

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

repetible.find( 'select' ).change( function() {
  usuario = { id: $( this ).val() };
  añadirÍtem( repetible, usuario );
});

$( '.repetible' ).parent().on( 'click', 'a', function() {
  usuario = $( this ).closest( '.row' ).find( 'select' ).children( ':selected' );
  usuario = { id: usuario.val(), nombre: usuario.text() }
  quitarÍtem( repetible, usuario );
});


// Principal

$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
