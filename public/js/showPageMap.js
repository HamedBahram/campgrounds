mapboxgl.accessToken = 'pk.eyJ1IjoiaGFtZWRiYWhyYW0iLCJhIjoiY2tjdDlnMjUzMTgzNDJzcGd4Zm83Z2J1bCJ9.juhm08o9kmVhpxfsdBTekg'
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10', // style URL
    center: camp.geometry.coordinates, // starting position [lng, lat]
    zoom: 12, // starting zoom
})

console.log(camp)
// const marker = new mapboxgl.Marker().setLngLat(camp.geometry.coordinates).addTo(map)

map.on('load', function () {
    map.loadImage(
        'http://localhost:3000/imgs/home-red.png',
        // Add an image to use as a custom marker
        function (error, image) {
            if (error) throw error
            map.addImage('custom-marker', image)

            map.addSource('places', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {
                                description: `
                                <div class="row">
                                    <div class="col-4">
                                        <img src=${camp.images[0].url} class="w-100" alt="">
                                    </div>
                                    <div class="col-8 pt-1">
                                        <h6 class="m-0">${camp.title}</h6>
                                        <p class="m-0">${camp.description}</p>
                                        <a href="/campgrounds/${camp._id}" class="link-info">view camp</a>
                                    </div>
                                </div>`,
                            },
                            geometry: {
                                type: 'Point',
                                coordinates: camp.geometry.coordinates,
                            },
                        },
                    ],
                },
            })

            // Add a layer showing the places.
            map.addLayer({
                id: 'places',
                type: 'symbol',
                source: 'places',
                layout: {
                    'icon-image': 'custom-marker',
                    'icon-allow-overlap': true,
                },
            })
        }
    )

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
    })

    map.on('mouseenter', 'places', function (e) {
        if (popup.isOpen()) return

        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer'

        const coordinates = e.features[0].geometry.coordinates.slice()
        const description = e.features[0].properties.description

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map)
    })

    // map.on('mouseleave', 'places', function () {
    //     map.getCanvas().style.cursor = ''
    //     popup.remove()
    // })
})
