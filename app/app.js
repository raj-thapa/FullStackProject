const csv = require("csv-parser");
const fs = require("fs");

const spring = [3, 4, 5];
const summer = [6, 7, 8];
const fall = [9, 10, 11];
const winter = [12, 1, 2];

const results = [];

fs.createReadStream("calendar.csv")
.pipe(csv())
.on("data", (data) => results.push(data))
.on("end", () => {
  const season = "spring";
  const number = 3;

  // Calculating average by listingId

  const countMap = {};
  const averageMap = {};

  const myData = {};

  for (const result of results) {
    const listingId = result.listing_id;

    if (!averageMap[listingId]) {
      averageMap[listingId] = 0;
    }

    if (!countMap[listingId]) {
      countMap[listingId] = 0;
    }

    averageMap[listingId] += parseFloat(result.price.split("$")[1].trim());
    countMap[listingId]++;

    myData[listingId] = {
      spring: [],
      summer: [],
      fall: [],
      winter: [],
    };
  }

  const finalAverageMap = {};

  for (const a in averageMap) {
    const avg = (averageMap[a] / countMap[a]).toFixed(3);
    finalAverageMap[a] = avg;
  }

  for (const result of results) {
    const date = new Date(result.date);
    const month = date.getMonth() + 1;
    const listingId = result.listing_id;
    const price = parseFloat(result.price.split("$")[1].trim());

    if (price < finalAverageMap[listingId]) {
      if (spring.includes(month)) {
        myData[listingId].spring.push({
          date: result.date,
          price: result.price,
        });
      } else if (summer.includes(month)) {
        myData[listingId].summer.push({
          date: result.date,
          price: result.price,
        });
      } else if (fall.includes(month)) {
        myData[listingId].fall.push({
          date: result.date,
          price: result.price,
        });
      } else {
        myData[listingId].winter.push({
          date: result.date,
          price: result.price,
        });
      }
    }
  }

  var result = {};

  for (const data in myData) {
    const list = myData[data][season];
    result[data] = [];
    if (Object.keys(result).length > 10) {
      break;
    } else {
      for (let i = 0; i < list.length; i++) {
        let count = 0;
        if (Object.keys(result).length > 10) {
          break;
        } else {
          for (let j = i; j < number + i; j++) {
            if (result[data].length == 2) {
              break;
            } else {
              if (j < list.length - number) {
                const month = parseInt(list[j].date.split("-")[1].trim());
                const day = parseInt(list[j].date.split("-")[2].trim());
                const nextMonth = parseInt(
                  list[j + 1].date.split("-")[1].trim()
                );
                const nextDay = parseInt(
                  list[j + 1].date.split("-")[2].trim()
                );

                if (nextDay - day == 1) {
                  count++;
                }

                if (count == number - 1) {
                  result[data].push({
                    date: list[i].date,
                    price: list[i].price,
                  });
                }
              } else {
                //   if (list.length >= 3) {
                //     const lastmonth = parseInt(
                //       list[list.length - 1].date.split("-")[1].trim()
                //     );
                //     const lastday = parseInt(
                //       list[list.length - 1].date.split("-")[2].trim()
                //     );
                //     const nextMonth = parseInt(
                //       list[list.length - 2].date.split("-")[1].trim()
                //     );
                //     const nextDay = parseInt(
                //       list[list.length - 2].date.split("-")[2].trim()
                //     );
                //     const firstMonth = parseInt(
                //       list[list.length - 3].date.split("-")[1].trim()
                //     );
                //     const firstDay = parseInt(
                //       list[list.length - 3].date.split("-")[2].trim()
                //     );
                //     if (lastday - nextDay == 1 && nextDay - firstDay == 1) {
                //       if (!is.includes(i)) is.push(i);
                //     }
                //   }
              }
            }
          }
        }
      }
    }
  }

  console.log(result); 
});
