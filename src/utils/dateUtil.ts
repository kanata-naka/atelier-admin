import moment from "moment";

const DEFAULT_DATE_TIME_FORMAT = "YYYY/MM/DD HH:mm";

export function getNowDate() {
  return moment().toDate();
}

export function getNowUnixTimestamp() {
  return moment().unix();
}

export function formatDateTimeFromUnixTimestamp(unixTimestamp: number, format: string = DEFAULT_DATE_TIME_FORMAT) {
  const dateTime = moment.unix(unixTimestamp);
  if (dateTime.isValid()) {
    return dateTime.format(format);
  }
}

export function getDateFromUnixTimestamp(unixTimestamp: number) {
  if (!unixTimestamp) return;
  const dateMoment = moment.unix(unixTimestamp);
  if (!dateMoment.isValid()) return;
  return dateMoment.toDate();
}

export function getUnixTimestampFromDate(date: Date) {
  const dateMoment = moment(date);
  if (!dateMoment.isValid()) return;
  return dateMoment.unix();
}
