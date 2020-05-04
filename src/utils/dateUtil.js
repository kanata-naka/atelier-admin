import moment from "moment"

const DEFAULT_DATE_TIME_FORMAT = "YYYY/MM/DD HH:mm"

export const getNowDate = () => {
  return moment().toDate()
}

export const getNowUnixTimestamp = () => {
  return moment().unix()
}

export const getDateFromUnixTimestamp = (unixTimestamp, initial) => {
  let dateValue = moment.unix(unixTimestamp)
  if (!unixTimestamp || !dateValue.isValid()) {
    return initial
  }
  return dateValue.toDate()
}

export const formatDateTimeFromUnixTimestamp = (
  unixTimestamp,
  format = DEFAULT_DATE_TIME_FORMAT
) => {
  const dateTime = moment.unix(unixTimestamp)
  if (dateTime.isValid()) {
    return dateTime.format(format)
  }
}

export const getUnixTimestampFromDate = date => {
  return moment(date).unix()
}
