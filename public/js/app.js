var dp = $('#fecha').datepicker({
  weekStart: 1,
  keyboardNavigation: false,
  todayHighlight: true
});

dp.datepicker('setDate', $('input[type=hidden]').val());

dp.on('changeDate', function(e){
  $('input[type=hidden]').val(e.date)
});

var algo

$( '#pagadores' ).on('change', '.form-group:last select', function() {
  selector = $('#pagadores .form-group:last');
  selector.clone().insertAfter(selector);
});
