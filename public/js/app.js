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


$( '#pagadores' ).on('change', 'input:enabled', function() {
	$('#pagadores input:disabled').val( function() {
		var sum = 0;
	  $('#pagadores input:enabled').each( function() {
			sum += Number($(this).val().replace(',','.'));
		});
		return String(sum.toFixed(2)).replace('.',',');
	});
});

usuarios = $('#pagadores').data('usuarios')

$('#pagadores select:last').prop('selectedIndex', -1)

// p class="form-control-static">email@example.com</p

$(document).ready( function() {
  $.each( usuarios, function( index, usuario ) {
    $( '#pagadores select:last' ).append( new Option( usuario.nombre, usuario.id ) );
  });
});

agregarPagadores = function() {
  selector = $('#pagadores .row:nth-last-child(2)');
  clon = selector.clone();

  clon.find('input').first().val('');
  clon.insertAfter(selector);
  $('#pagadores select:active').prop('disabled', true);
}

$( '#pagadores' ).on('change', 'select', agregarPagadores );



$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
