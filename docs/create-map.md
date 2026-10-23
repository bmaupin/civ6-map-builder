# Create a new map

1. Decide how many tiles you want your map to be, e.g.
   - 36x24
1. Open your favourite map software
1. Determine the centre
   1. Navigate to the West edge of the map and get the coordinates, e.g. 34.030995, 35.619920
      - The first number is latitude (north/south), the second is longitude
   1. Do the same for the East edge of the map, e.g. 32.871741, 52.925276
   1. Now South, e.g. 29.192718, 44.033547
   1. And North, e.g. 37.886469, 42.811008
   1. Take the longitudes (first value) of the North and South edges, and average them, e.g.
      - (29.192718 + 37.886469) / 2 = 33.5395935
      - Set this as `lat_centre`
   1. Take the latitudes (second value) of the East and West edges, and average them
      - (35.619920 + 52.925276) / 2 = 44.272598
      - Set this as `lon_centre`
   1. This is the centre of your map, e.g.
      - 33.5395935, 44.272598
1. Determine the scale
   1. Decide whether you want to limit your map by width or height
      - Whichever you use will have its limits set at the sides you picked and the other will adjust automatically

   1. Calculate the width (or height) of the map

      1. Go here

         https://www.nhc.noaa.gov/gccalc.shtml

      1. If you want the width to be fixed
         - Use the average latitude for both values
         - Use the East longitude for the first value
         - Use the West longitude for the second value

      1. If you want the height to be fixed
         - Use the average longitude for both values
         - Use the North latitude for the first value
         - Use the South latitude for the second value

      1. Then calculate the distance in km, e.g.

         1601 km

      1. Multiply by 1000 to convert to meters then divide by number of tiles on that side, e.g.

         1601 * 1000 / 36 = 44472

      1. Set this value as `scaler`
