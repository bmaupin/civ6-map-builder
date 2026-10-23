# APIs

## WorldClimateZonesSimp

https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/WorldClimateZonesSimp/FeatureServer

#### One coordinate

```
curl --get --silent --show-error --fail \
 'https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/WorldClimateZonesSimp/FeatureServer/0/query' \
 --data-urlencode 'f=pjson' \
 --data-urlencode 'geometry=44.272598,33.5395935' \
 --data-urlencode 'geometryType=esriGeometryPoint' \
 --data-urlencode 'inSR=4326' \
 --data-urlencode 'spatialRel=esriSpatialRelIntersects' \
 --data-urlencode 'outFields=CLIMATE' \
 --data-urlencode 'returnGeometry=false'
```

#### Range

```
curl --get --silent --show-error --fail \
  'https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/WorldClimateZonesSimp/FeatureServer/0/query' \
  --data-urlencode 'f=pjson' \
  --data-urlencode 'geometry={"xmin":33,"ymin":44,"xmax":45,"ymax":34}' \
  --data-urlencode 'geometryType=esriGeometryEnvelope' \
  --data-urlencode 'inSR=4326' \
  --data-urlencode 'spatialRel=esriSpatialRelIntersects' \
  --data-urlencode 'outFields=CLIMATE' \
  --data-urlencode 'returnGeometry=false'
```

```
curl --get --silent --show-error --fail \
  'https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/WorldClimateZonesSimp/FeatureServer/0/query' \
  --data-urlencode 'geometry={"xmin":33,"ymin":44,"xmax":34,"ymax":45}' \
  --data-urlencode 'geometryType=esriGeometryEnvelope' \
  --data-urlencode 'inSR=4326' \
  --data-urlencode 'spatialRel=esriSpatialRelIntersects' \
  --data-urlencode 'outFields=CLIMATE' \
  --data-urlencode 'returnGeometry=true' \
  --data-urlencode 'outSR=4326' \
  --data-urlencode 'f=geojson'
```

## Others

- https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services/Ecoregions_of_the_World/FeatureServer
  - Too many categories; dozens of ecoregions to map
  - Map data not detailed enough; doesn't match the coastline very well
- [RESOLVE Ecoregions and Biomes](https://www.arcgis.com/home/item.html?id=37ea320eebb647c6838c23f72abae5ef)
  - https://data-gis.unep-wcmc.org/server/rest/services/Bio-geographicalRegions/Resolve_Ecoregions/FeatureServer/0?utm_source=chatgpt.com
  - Very good level of detail
  - No way to distinguish grassland and plains
- Others: https://services.arcgis.com/BG6nSlhZSAWtExvp/ArcGIS/rest/services
