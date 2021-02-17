mapboxgl.accessToken =
    'pk.eyJ1IjoiaGFtZWRiYWhyYW0iLCJhIjoiY2tjdDlnMjUzMTgzNDJzcGd4Zm83Z2J1bCJ9.juhm08o9kmVhpxfsdBTekg'
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-79.3849, 43.6529],
    zoom: 8,
})

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl())

// Add geolocate control to the map.
map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        trackUserLocation: true,
    })
)

map.on('load', function () {
    // Add a new source from our GeoJSON data and
    // set the 'cluster' option to true. GL-JS will
    // add the point_count property to your source data.
    map.addSource('campgrounds', {
        type: 'geojson',
        // Point to GeoJSON data. This example visualizes all M1.0+ campgrounds
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
    })

    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#51bbd6',
                10,
                '#f1f075',
                50,
                '#f28cb1',
            ],
            'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
        },
    })

    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
        },
    })

    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
        },
    })

    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
        })
        const clusterId = features[0].properties.cluster_id
        map.getSource('campgrounds').getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err) return

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
            })
        })
    })

    // When a click event occurs on a feature in
    // the unclustered-point layer, open a popup at
    // the location of the feature, with
    // description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice()
        const popupHTML = e.features[0].properties.popupHTML
        // Ensure popup appears over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }
        new mapboxgl.Popup().setLngLat(coordinates).setHTML(popupHTML).addTo(map)
    })

    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = ''
    })

    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = ''
    })
})
