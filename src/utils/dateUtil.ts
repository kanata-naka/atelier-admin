import moment from "moment";

const DEFAULT_DATE_TIME_FORMAT = "YYYY/MM/DD HH:mm";

export function formatDateTimeFromUnixTimestamp(unixTimestamp: number, format: string = DEFAULT_DATE_TIME_FORMAT) {
  const dateTime = moment.unix(unixTimestamp);
  if (dateTime.isValid()) {
    return dateTime.format(format);
  }
}
