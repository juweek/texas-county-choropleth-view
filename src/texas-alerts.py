import requests
import json
import time
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
import csv
import io
import os
import argparse
import sys
from datetime import datetime
import pytz

# Set up argument parser
parser = argparse.ArgumentParser(description='Collect weather data for Texas counties')
parser.add_argument('--county-file', type=str, help='Path to Texas counties CSV file')
parser.add_argument('--sample', action='store_true', help='Use sample county data instead of a file')
parser.add_argument('--max-workers', type=int, default=3, help='Maximum number of concurrent workers')
parser.add_argument('--output-dir', type=str, default='.', help='Directory for output files')
parser.add_argument('--include-alerts', action='store_true', help='Include NWS alerts in the data collection')
args = parser.parse_args()

# Function to create a sample counties file from the provided data
def create_sample_counties_file():
    # Sample county data string provided by the user
    county_data_string = """X (Lat),Y (Long),CNTY_NM,CNTY_NBR,FIPS,Shape_Leng,Shape_Area,County Centroid Location
33.97408519,-99.77871109,Foard,79,48155,2.302711251,0.177999074,POINT (-99.77871109 33.97408519)
30.26636128,-98.39974086,Blanco,16,48031,1.683596565,0.173305894,POINT (-98.39974086 30.26636128)
33.60750375,-102.3430919,Hockley,111,48219,1.922123942,0.228718494,POINT (-102.3430919 33.60750375)"""
    
    sample_file = os.path.join(args.output_dir, "texas_counties_sample.csv")
    
    # Create the sample file
    with open(sample_file, "w") as f:
        f.write(county_data_string)
    
    print(f"Created sample file: {sample_file}")
    return sample_file

# Function to load county data from a CSV file
def load_county_data_from_file(file_path):
    try:
        # Read the CSV file
        df = pd.read_csv(file_path)
        
        # Extract required columns
        counties = []
        for _, row in df.iterrows():
            counties.append({
                "name": row["CNTY_NM"],
                "latitude": row["X (Lat)"],
                "longitude": row["Y (Long)"],
                "fips": str(row["FIPS"]) if "FIPS" in row else None  # Include FIPS code if available for alert matching
            })
        
        return counties
    except Exception as e:
        print(f"Error loading county data from file: {e}")
        return []

# Function to verify the CSV file format
def verify_csv_format(file_path):
    try:
        # Read the first few rows of the CSV file
        df = pd.read_csv(file_path, nrows=5)
        
        # Check if required columns exist
        required_columns = ["X (Lat)", "Y (Long)", "CNTY_NM"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            print(f"Error: Missing required columns in CSV file: {missing_columns}")
            return False
        
        return True
    except Exception as e:
        print(f"Error verifying CSV format: {e}")
        return False

# NEW FUNCTION: Get all active weather alerts for Texas
def get_texas_alerts():
    url = "https://api.weather.gov/alerts/active?area=TX"
    headers = {"User-Agent": "WeatherDataCollector/1.0", "Accept": "application/json"}
    
    try:
        print("Fetching active weather alerts for Texas...")
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        alerts_data = response.json()
        
        if "features" not in alerts_data or not alerts_data["features"]:
            print("No active alerts found for Texas")
            return []
        
        processed_alerts = []
        for feature in alerts_data["features"]:
            properties = feature["properties"]
            
            # Extract county information from the alert
            affected_counties = []
            
            # Extract from areaDesc (text description of affected areas)
            area_desc = properties.get("areaDesc", "")
            
            # Extract SAME codes (specific county identifiers)
            same_codes = []
            if "geocode" in properties and "SAME" in properties["geocode"]:
                same_codes = properties["geocode"]["SAME"]
            
            alert = {
                "id": properties.get("id"),
                "event": properties.get("event"),
                "headline": properties.get("headline"),
                "description": properties.get("description"),
                "severity": properties.get("severity"),
                "urgency": properties.get("urgency"),
                "certainty": properties.get("certainty"),
                "effective": properties.get("effective"),
                "expires": properties.get("expires"),
                "areaDesc": area_desc,
                "sameCodes": same_codes
            }
            
            processed_alerts.append(alert)
        
        print(f"Found {len(processed_alerts)} active alerts for Texas")
        return processed_alerts
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Texas alerts: {e}")
        return []

# NEW FUNCTION: Match alerts to a specific county
def match_alerts_to_county(county, all_alerts):
    # The county name as it would appear in alerts
    county_name = county["name"].upper() + " COUNTY"
    # FIPS code with the format 048XXX where XXX is the county FIPS
    county_fips = county.get("fips")
    
    if county_fips and len(county_fips) == 5:
        # Format SAME code as expected in NWS alerts (048 is the state code for Texas)
        county_same = "048" + county_fips[-3:]
    else:
        county_same = None
    
    matching_alerts = []
    
    for alert in all_alerts:
        # Check if county name appears in the area description
        if county_name in alert["areaDesc"].upper():
            matching_alerts.append(alert)
            continue
        
        # Check if county SAME code matches
        if county_same and county_same in alert["sameCodes"]:
            matching_alerts.append(alert)
            continue
    
    return matching_alerts

# Function to get gridpoint URL from latitude and longitude
def get_gridpoint_url(lat, lon):
    url = f"https://api.weather.gov/points/{lat},{lon}"
    headers = {"User-Agent": "WeatherDataCollector/1.0", "Accept": "application/json"}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data["properties"]["forecastGridData"]
    except requests.exceptions.RequestException as e:
        print(f"Error getting gridpoint for {lat}, {lon}: {e}")
        return None

# Function to extract the latest value from a time series
def extract_latest_value(time_series):
    if not time_series or "values" not in time_series or not time_series["values"]:
        return {"value": None, "unit": None, "validTime": None}
    
    latest = time_series["values"][0]
    return {
        "value": latest["value"],
        "unit": time_series.get("uom"),
        "validTime": latest["validTime"]
    }

# Function to extract hazards information
def extract_hazards(hazards_data):
    if not hazards_data or "values" not in hazards_data or not hazards_data["values"]:
        return []
    
    hazards = []
    for value in hazards_data["values"]:
        if "value" in value and isinstance(value["value"], list):
            for hazard in value["value"]:
                hazards.append({
                    "phenomenon": hazard.get("phenomenon"),
                    "significance": hazard.get("significance"),
                    "eventNumber": hazard.get("event_number"),
                    "validTime": value["validTime"]
                })
    
    return hazards

# Function to get weather data for a single county
def get_county_weather(county, texas_alerts=None):
    print(f"Processing {county['name']} County...")
    gridpoint_url = get_gridpoint_url(county["latitude"], county["longitude"])
    
    if not gridpoint_url:
        print(f"Could not get gridpoint URL for {county['name']} County")
        return None
    
    # Add a small delay to avoid rate limiting
    time.sleep(1)
    
    headers = {"User-Agent": "WeatherDataCollector/1.0", "Accept": "application/json"}
    
    try:
        response = requests.get(gridpoint_url, headers=headers)
        response.raise_for_status()
        grid_data = response.json()
        
        # Extract the weather data we want
        county_weather = {
            "countyName": county["name"],
            "coordinates": {
                "latitude": county["latitude"],
                "longitude": county["longitude"]
            },
            "data": {}
        }
        
        # Add temperature if available
        if "temperature" in grid_data["properties"]:
            county_weather["data"]["temperature"] = extract_latest_value(grid_data["properties"]["temperature"])
        
        # Add relative humidity if available
        if "relativeHumidity" in grid_data["properties"]:
            county_weather["data"]["relativeHumidity"] = extract_latest_value(grid_data["properties"]["relativeHumidity"])
        
        # Add hazards if available
        if "hazards" in grid_data["properties"]:
            county_weather["data"]["hazards"] = extract_hazards(grid_data["properties"]["hazards"])
        
        # Add probability of precipitation if available
        if "probabilityOfPrecipitation" in grid_data["properties"]:
            county_weather["data"]["probabilityOfPrecipitation"] = extract_latest_value(grid_data["properties"]["probabilityOfPrecipitation"])
        
        # Add visibility if available
        if "visibility" in grid_data["properties"]:
            county_weather["data"]["visibility"] = extract_latest_value(grid_data["properties"]["visibility"])
        
        # Add alerts if available and requested
        if args.include_alerts and texas_alerts is not None:
            matching_alerts = match_alerts_to_county(county, texas_alerts)
            if matching_alerts:
                county_weather["data"]["alerts"] = matching_alerts
                print(f"Found {len(matching_alerts)} alerts for {county['name']} County")
        
        print(f"Successfully processed {county['name']} County")
        return county_weather
    
    except requests.exceptions.RequestException as e:
        print(f"Error getting weather data for {county['name']} County: {e}")
        return None

# Main function to get weather data for all counties
def get_all_counties_weather(counties, max_workers=3, include_alerts=False):
    results = []
    
    # Get all Texas alerts first if alerts are requested
    texas_alerts = None
    if include_alerts:
        texas_alerts = get_texas_alerts()
    
    # Show progress
    total_counties = len(counties)
    print(f"Starting to process {total_counties} counties with {max_workers} workers...")
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(get_county_weather, county, texas_alerts): county for county in counties}
        
        completed = 0
        for future in futures:
            county_weather = future.result()
            completed += 1
            
            if county_weather:
                results.append(county_weather)
                print(f"Progress: {completed}/{total_counties} counties processed")
            else:
                print(f"Progress: {completed}/{total_counties} counties processed (failed)")
    
    return results

# Function to flatten the data structure for CSV
def convert_to_csv(weather_data, output_path):
    flattened_data = []
    
    for county in weather_data:
        county_data = {
            "countyName": county["countyName"],
            "latitude": county["coordinates"]["latitude"],
            "longitude": county["coordinates"]["longitude"]
        }
        
        # Add temperature data
        if "temperature" in county["data"]:
            county_data["temperature"] = county["data"]["temperature"]["value"]
            county_data["temperature_unit"] = county["data"]["temperature"]["unit"]
        
        # Add humidity data
        if "relativeHumidity" in county["data"]:
            county_data["relativeHumidity"] = county["data"]["relativeHumidity"]["value"]
        
        # Add precipitation probability
        if "probabilityOfPrecipitation" in county["data"]:
            county_data["precipitationProbability"] = county["data"]["probabilityOfPrecipitation"]["value"]
        
        # Add visibility
        if "visibility" in county["data"]:
            county_data["visibility"] = county["data"]["visibility"]["value"]
            county_data["visibility_unit"] = county["data"]["visibility"]["unit"]
        
        # Add hazards (first hazard only for CSV simplicity)
        if "hazards" in county["data"] and county["data"]["hazards"]:
            hazard = county["data"]["hazards"][0]
            county_data["hazard_phenomenon"] = hazard["phenomenon"]
            county_data["hazard_significance"] = hazard["significance"]
        else:
            county_data["hazard_phenomenon"] = None
            county_data["hazard_significance"] = None
        
        # Add alert information (first alert only for CSV simplicity)
        if "alerts" in county["data"] and county["data"]["alerts"]:
            alert = county["data"]["alerts"][0]
            county_data["alert_event"] = alert["event"]
            county_data["alert_severity"] = alert["severity"]
            county_data["alert_urgency"] = alert["urgency"]
            county_data["alert_expires"] = alert["expires"]
        else:
            county_data["alert_event"] = None
            county_data["alert_severity"] = None
            county_data["alert_urgency"] = None
            county_data["alert_expires"] = None
        
        flattened_data.append(county_data)
    
    # Convert to DataFrame and save as CSV
    df = pd.DataFrame(flattened_data)
    df.to_csv(output_path, index=False)
    print(f"Data saved to CSV: {output_path}")

# Process all counties and save the data
def process_and_save(counties):
    # Get weather data for all counties
    weather_data = get_all_counties_weather(counties, max_workers=args.max_workers, include_alerts=args.include_alerts)
    
    # Create output directories if they don't exist
    os.makedirs(args.output_dir, exist_ok=True)
    os.makedirs('public', exist_ok=True)
    os.makedirs('dist', exist_ok=True)
    
    # Save to JSON files in both locations
    json_outputs = [
        os.path.join(args.output_dir, "texas_counties_weather.json"),
        os.path.join('public', "texas_counties_weather.json"),
        os.path.join('dist', "texas_counties_weather.json")
    ]
    
    # Save to CSV files in both locations
    csv_outputs = [
        os.path.join(args.output_dir, "texas_counties_weather.csv"),
        os.path.join('public', "texas_counties_weather.csv"),
        os.path.join('dist', "texas_counties_weather.csv")
    ]
    
    # Save timestamp file in both locations
    timestamp_outputs = [
        os.path.join(args.output_dir, "weather_timestamp.json"),
        os.path.join('public', "weather_timestamp.json"),
        os.path.join('dist', "weather_timestamp.json")
    ]
    
    # Save JSON data
    for output_path in json_outputs:
        with open(output_path, 'w') as f:
            json.dump(weather_data, f, indent=2)
        print(f"Data saved to JSON: {output_path}")
    
    # Save CSV data
    for output_path in csv_outputs:
        convert_to_csv(weather_data, output_path)
    
    # Save timestamp
    for output_path in timestamp_outputs:
        # Get current time in Central Time Zone (CDT/CST)
        central_tz = pytz.timezone('US/Central')
        current_time = datetime.now(central_tz)
        
        # Format timestamp: "April 23, 2025 at 2:30 PM CDT"
        formatted_time = current_time.strftime("%B %d, %Y at %I:%M %p %Z")
        print(f"Creating timestamp with formatted time: {formatted_time}")
        
        timestamp_data = {
            "last_updated": formatted_time,
            "timestamp_utc": datetime.now(pytz.UTC).isoformat()
        }
        
        with open(output_path, 'w') as f:
            json.dump(timestamp_data, f, indent=2)
        print(f"Timestamp saved to: {output_path}")
        # Verify timestamp file contents
        with open(output_path, 'r') as f:
            saved_data = json.load(f)
            print(f"Verification - timestamp file contents: {saved_data}")

def main():
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Determine source of county data
    county_file = None
    
    if args.sample:
        # Use sample data
        county_file = create_sample_counties_file()
    elif args.county_file:
        # Use provided file
        county_file = args.county_file
        if not os.path.exists(county_file):
            print(f"Error: County file not found: {county_file}")
            sys.exit(1)
    else:
        # No source specified, prompt user
        use_sample = input("No county file specified. Use sample data? (y/n): ")
        if use_sample.lower() == 'y':
            county_file = create_sample_counties_file()
        else:
            county_file = input("Enter the path to your Texas counties CSV file: ")
            if not os.path.exists(county_file):
                print(f"Error: File not found: {county_file}")
                sys.exit(1)
    
    # Verify the CSV format
    if not verify_csv_format(county_file):
        print("The CSV file does not have the required format.")
        print("Required columns: 'X (Lat)', 'Y (Long)', 'CNTY_NM'")
        sys.exit(1)
    
    # Load county data
    counties = load_county_data_from_file(county_file)
    if not counties:
        print("No county data loaded. Exiting.")
        sys.exit(1)
    
    # Display the counties we're going to process
    print(f"Loaded {len(counties)} counties:")
    for i, county in enumerate(counties[:5]):
        print(f"  - {county['name']}: ({county['latitude']}, {county['longitude']})")
    
    if len(counties) > 5:
        print(f"  ...and {len(counties) - 5} more")
    
    # Check if running in CI environment
    is_ci = os.environ.get('CI') == 'true'
    
    # Skip confirmation in CI environment
    if is_ci:
        print("Running in CI environment - proceeding without confirmation")
        process_and_save(counties)
    else:
        # Confirm to proceed
        proceed = input(f"Proceed with data collection for {len(counties)} counties? (y/n): ")
        if proceed.lower() == 'y':
            process_and_save(counties)
        else:
            print("Operation cancelled.")

if __name__ == "__main__":
    main()