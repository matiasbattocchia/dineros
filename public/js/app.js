var dp = $('#fecha').datepicker({
  weekStart: 1,
  keyboardNavigation: false,
  todayHighlight: true
});

dp.datepicker('setDate', ''); 

dp.on('changeDate', function(e){
  $('input[type=hidden]').val(e.date)
});
