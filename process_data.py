'''
Combine the AAMC data with the state
coordinate data and output an aggregate
.json file
'''
import csv
import collections
import json
from pprint import pprint

aamc_filename = "aamc.csv"
coords_filename = "us-states.json"
output_filename = "us-aamc-states.json"

def recursively_default_dict():
    return collections.defaultdict(recursively_default_dict)

def csv_to_dict(filename):
	file = open(filename, "rb")
	reader = csv.reader(file, delimiter=";")

	rownum = 0
	data = recursively_default_dict()

	for row in reader:
		if rownum is not 0:
			state = row[0]
			app_type = row[1]
			race = row[2]
			count = row[3]

			data[state]["aamc_data"][app_type][race] = count
		
		rownum += 1

	return data

def json_to_dict(filename):
	json_data = open(filename)
	data = json.load(json_data)
	json_data.close
	return data

def merge_data(csv_data, coords_data):
	merged = coords_data

	for feature in merged["features"]:
		state_name = feature["properties"]["name"]
		feature["aamc_data"] = csv_data[state_name]["aamc_data"]

	return merged

def output_to_json(data):
	output = json.dumps(data)
	f = open(output_filename, "wb")
	f.write(output)
	f.close()

	


csv_data = csv_to_dict(aamc_filename)
coords_data = json_to_dict(coords_filename)
merged_data = merge_data(csv_data, coords_data)
output_to_json(merged_data)





