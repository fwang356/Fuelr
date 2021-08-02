import googlemaps
import polyline
import requests
from bs4 import BeautifulSoup
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


# Returns the distance along the route at which to search for a gas station.
def get_stop_distance(range):
    return range - 50


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


# Googles the address of a gas station and returns the link to its GasBuddy page.
def google_scrape(address):
    address = address.replace(" ", "+")
    address = address + '+gasbuddy'

    url = 'https://google.com/search?q=' + address
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')

    search = soup.find('div', class_='kCrYT')
    link = search.a['href']
    index = link.find('&')
    link = link[7:index]
    return link

# TODO: Eric can u return it as a dictionary
# Like {'address': address, 'price': price, 'rating': rating}
# Also check if the recommended stations are already in the list of addresses
# So we don't have duplicates
def gasbuddy_scrape(link, address, gas_type):
    pass


# Returns gas stations ranked from most optimal to least.
def sort(addresses):
    info = []
    
    for address in addresses:
        link = google_scrape(address)
        if 'https://gasbuddy.com/station/' in link:
            price = gasbuddy_scrape(link)
            info.append(price)
    
    sorted_prices = sorted(info, key= lambda k: k['price'])
    sorted_rating = sorted(info, reverse= True, key= lambda k: k['rating'])
    stations = []

    for address in addresses:
        for i in range(len(sorted_prices)):
            if sorted_prices[i]['address'] == address['address']:
                break
        for j in range(len(sorted_rating)):
            if sorted_rating[j]['address'] == address['address']:
                break
        item = {'station': address, 'index': 2 * i + j}
        stations.append(item)
    
    sorted_stations = sorted(stations, key= lambda k: k['index'])
    return sorted_stations