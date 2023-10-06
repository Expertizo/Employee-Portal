function epoch(date) {
  return new Date(date).getTime() / 1000
}

function epochToDate(ep) {
  const utcSeconds = ep;
  const d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  return new Date(d.setUTCSeconds(utcSeconds))
}

function getCurrentMonthStartAndEndDate() {
  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return { firstDay, lastDay }
}

export {
  epoch,
  epochToDate,
  getCurrentMonthStartAndEndDate
}