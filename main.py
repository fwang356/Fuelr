import googlemaps
import polyline
import requests
from bs4 import BeautifulSoup
import os
import concurrent.futures
import time

apikey = os.getenv('key')
apikey = 'AIzaSyBNMEWQATMF1WX6nNvflDEYVpiw_LaWWq8'

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
    miles = range - 50
    meters = miles * 1000 / 0.62137119
    return meters


# Binary search to find point at which to search for a gas station.
def binary_search(original, points, remainder):
    length = len(points)
    index = int(length / 2)
    if get_distance(points[0], points[length - 1]) < 1610:
        return points[index]
    if get_distance(original[0], points[index]) > remainder:
        if get_distance(original[0], points[index - 1]) < remainder:
            return points[index - 1]
        else:
            array = points[0:index]
            return binary_search(original, array, remainder)
    elif get_distance(original[0], points[index]) < remainder:
        if get_distance(original[0], points[index + 1]) > remainder:
            return points[index]
        else:
            array = points[index + 1:]
            return binary_search(original, array, remainder)


# Returns the longitude and latitude of where to search for a gas station.
def get_gas_stop(start, end, distance):
    points = []
    directions = get_directions(start, end)
    total_distance = directions[0]['legs'][0]['distance']['value']
    if total_distance < distance:
        geocode = get_geocode(end)
        lat = geocode['lat']
        lng = geocode['lng']
        point = (lat, lng)
        points.append(point)
        return points

    stop_count = total_distance / distance
    steps = directions[0]['legs'][0]['steps']
    sum = 0
    for count in range(int(stop_count)):

        for i in range(len(steps)):
            if sum + steps[i]['distance']['value'] > distance:
                difference = sum + steps[i]['distance']['value'] - distance
                if difference > steps[i]['distance']['value'] / 2:
                    larger = False
                    break
                else:
                    larger = True
                    break
            else:
                sum = sum + steps[i]['distance']['value']

        line = steps[i]['polyline']['points']
        point = polyline.decode(line)
        length = len(point)
        if larger:
            start_index = int(length / 2)
            end_index = length - 1
            remainder = steps[i]['distance']['value'] / 2 - difference
        else:
            start_index = 0
            end_index = int(length / 2) + 1
            remainder = steps[i]['distance']['value'] - difference

        search_array = point[start_index:end_index]

        stop_point = binary_search(search_array, search_array, remainder)
        points.append(binary_search(search_array, search_array, remainder))
        sum = difference
        steps = steps[i+1:]
    return points


# Returns list of gas station addresses within a certain radius of a point.
def get_gas_stations(point, radius):
    addresses = []
    gas_stations = gmaps.places_nearby(point, radius, type='gas_station')['results']

    while len(gas_stations) < 5:
        radius = radius * 1.5
        gas_stations = gmaps.places_nearby(point, radius, type='gas_station')['results']

    gas_stations = gas_stations[0:5]

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
    search = soup.find_all('div', class_='kCrYT')
    for result in search:
        if result.a == None:
            continue
        elif 'www.gasbuddy.com/station/' in result.a['href']:
            break
    if result.a == None:
        return 'lol'
    else:
        link = result.a['href']
        index = link.find('&')
        link = link[7:index]
        return link


# Given a gas station link (link) and a desired gas type (gas_type), returns the price of the gas and the rating of the station
def gasbuddy_scrape(address, link, gas_type):
    page = requests.get(link, headers={'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36 Edg/92.0.902.62'})
    soup = BeautifulSoup(page.content, 'html.parser')
    price = None
    rating = None
    
    # Filter for the divs that contain each type of gas and their prices
    price_elements = soup.find('div', class_='carousel__scrollContainer___hDjMb').children

    # Iterate through every gas type provided
    for element in price_elements:
        type = element.find('span', class_='text__fluid___1X7fO').string

        if type == gas_type:
        
            # Try to find a price; if it fails, invalidate the station being returned
            try:
                price = float(element.find('span', class_='FuelTypePriceDisplay-module__price___3iizb').string.strip('$'))
            except ValueError:
                price = 1000
            
            # Try to find a rating; if it fails, invalidate the station being returned
            try:
                rating = soup.find('span', class_='ReviewPanel-module__averageRating___3KmW2').string 
            except AttributeError:
                rating = -500
    
    # If the desired gas type is not available, invalidate the station being returned
    if price is None or rating is None:
        price = 1000
        rating = -500

    return {'address': address, 'rating': rating, 'price': price}


# Utilizes scrapers and returns price and rating for each address.
def scrape(address, gas_type):
    info = []
    link = google_scrape(address)
    if 'https://www.gasbuddy.com/station/' in link:
            station_info = gasbuddy_scrape(address, link, gas_type)
            info.append(station_info)
    return info


# Returns gas stations ranked from most optimal to least.
def sort(addresses, gas_type):
    info = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        future_list = {executor.submit(scrape, address, gas_type) for address in addresses}

    for i in future_list:
        info.append(i.result())

    stations = []

    for future in info:
        for address in future:
            item = {'position': get_geocode(address['address']), 'station': address['address'],
                'price': '$' + str(address['price']), 'rating':str(address['rating'])+"/5",
                'index': 3 * address['price'] - float(address['rating'])}
            stations.append(item)
    
    sorted_stations = sorted(stations, key= lambda k: k['index'])
    return sorted_stations


# Searches for a placed based on user input query.
def search(query):
    autocomplete = gmaps.places_autocomplete(query, components={'country': ['US']})
    results = []
    for result in autocomplete:
        results.append(result['description'])
    return results