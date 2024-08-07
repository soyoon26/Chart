interface DataItem {
  Date: string;
  [key: string]: any;
}

const getLatestData = (data: DataItem[]) => {
  const dataWithDates = data.map((item) => ({
    ...item,
    DateObject: new Date(item.Date),
  }));

  const latestDateObject = new Date(
    Math.max(...dataWithDates.map((item) => item.DateObject.getTime()))
  );

  const filteredLatestData = dataWithDates.filter(
    (item) => item.DateObject.getTime() === latestDateObject.getTime()
  );

  return filteredLatestData;
};

export default getLatestData;
