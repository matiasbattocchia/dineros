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

$( '#pagadores' ).on('change', '.pagos:last select', function() {
  selector = $('#pagadores .pagos:last');
  clon = selector.clone();
	clon.find('input').first().val('');
	clon.insertAfter(selector);
});

$( '#pagadores' ).on('change', 'input:enabled', function() {
	$('#pagadores input:disabled').val( function() {
		var sum = 0;
	  $('#pagadores input:enabled').each( function() {
			sum += Number($(this).val().replace(',','.'));
		});
		return String(sum.toFixed(2)).replace('.',',');
	});
});


$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
