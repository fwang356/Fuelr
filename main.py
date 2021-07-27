import googlemaps
import polyline
from client import apikey

gmaps = googlemaps.Client(key=apikey)


# Returns the longitude and latitude of address.
def get_geocode(address):
    geocode = gmaps.geocode(address)[0]['geometry']['location']
    return geocode


# Returns the directions between a start point and end point.
def get_directions(start, end):
    return gmaps.directions(start, end)


# Returns the distance between two points.
def get_distance(start, end):
    directions = get_directions(start, end)
    return directions[0]['legs'][0]['distance']['value']


# TODO: Determine user inputs and calculate where to search for a gas station.
# Returns the distance along the route at which to search for a gas station.
def get_stop_distance(mpg, other_user_inputs_idk_what_yet):
    pass


# Returns the longitude and latitude of where to search for a gas station.
def get_gas_stop(directions, distance):
    total_distance = directions[0]['legs'][0]['distance']['value']
    steps = directions[0]['legs'][0]['steps']

    if total_distance < distance:
        return "You Don't Need to Fuel Up During This Trip!"

    sum = 0

    for i in steps:
        if sum + i['distance']['value'] > distance:
            break
        else:
            sum = sum + i['distance']['value']
    
    line = i['polyline']['points']
    points = polyline.decode(line)

    for j in range(len(points)):
        sum = sum + get_distance(points[j], points[j + 1])
        if sum > distance:
            break

    return points[j]


# Returns list of gas station addresses within a certain radius of a point.
def get_gas_stations(point, radius):
    addresses = []
    gas_stations = gmaps.places_nearby(point, radius, type='gas_station')['results']

    while len(gas_stations) < 10:
        radius = radius * 1.5
        gas_stations = gmaps.places_nearby(point, radius, type='gas_station')['results']

    for i in gas_stations:
        addresses.append(i['vicinity'])
    return addresses