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
  selector.find( 'option[value=' + opción.id + ']' ).remove();
};

añadirÍtem = function( repetible, ítem ) {
  repetido = repetible.clone();

  var selector = repetido.find( 'select' );
  selector.val( ítem.id );
  selector.prop( 'disabled', true );
 
  repetido.find( 'input' ).val( ítem.monto );

  repetible.parent().before( repetido );

  ////
  quitarOpción( repetible.find( 'select' ), ítem );
}

quitarÍtem = function(pagador) {
  usuario = { id: pagador.find( 'select' ).first().val(),
              nombre: pagador.find( 'select' ).first().text() }
  pagador.remove();

  ////
  añadirOpción( selector, usuario );
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

contexto = $( '.repetible' ).parent();


contexto.on( 'click', 'a', function() {
  var pagador = $( this ).closest( '.row' );
  quitarPagador(pagador);
});



repetible.find( 'select' ).change( function() {
  usuario = $( this );
  añadirÍtem( repetible, usuario );
});


// Principal

$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
