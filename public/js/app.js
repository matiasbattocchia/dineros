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

$( '#pagadores' ).on('change', '.row:last select', function() {
  selector = $('#pagadores .row:last');
  selector.clone().insertAfter(selector);
});

$( 'tr' ).click( function() {
  window.location = $(this).data('href');
});
