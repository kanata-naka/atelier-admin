import moment from "moment"

const DEFAULT_DATE_TIME_FORMAT = "YYYY/MM/DD HH:mm"

export const formatDateTimeFromUnixTimestamp = (
  unixTimestamp,
  format = DEFAULT_DATE_TIME_FORMAT
) => {
  const dateTime = moment.unix(unixTimestamp)
  if (dateTime.isValid()) {
    return dateTime.format(format)
  }
}
