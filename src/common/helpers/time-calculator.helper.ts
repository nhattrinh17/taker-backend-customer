export function calculateTimeDifferenceV2(lat1: number, lon1: number, lat2: number, lon2: number, unit = 'K') {
  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
    dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == 'K') {
    dist = dist * 1.609344;
  }
  if (unit == 'N') {
    dist = dist * 0.8684;
  }

  // increase distance by 30%
  dist = dist + dist * 0.3;
  // console.log('🚀 ~ dist:', dist);

  // average speed 10km/h
  const v = 20;
  let timeDifference = (dist / v) * 60;
  if (timeDifference < 5) {
    timeDifference = 5;
  }

  return { time: timeDifference, distance: dist };
}

// Example usage
// const sourceLatitude = 40.7128; // Latitude of source location (New York)
// const sourceLongitude = -74.006; // Longitude of source location (New York)
// const destinationLatitude = 34.0522; // Latitude of destination location (Los Angeles)
// const destinationLongitude = -118.2437; // Longitude of destination location (Los Angeles)

// const destinationLocalTime = calculateTimeDifference(
//   sourceLatitude,
//   sourceLongitude,
//   destinationLatitude,
//   destinationLongitude,
// );
// console.log('Destination local time:', destinationLocalTime);
