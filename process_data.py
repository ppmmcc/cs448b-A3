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
cleaned_aamc_filename = "aamc_by_state.json"

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

def get_aamc_race_data(filename):
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

			data[state][app_type][race] = count
		
		rownum += 1
	return data

'''
Merge the Hispanic races
and add up a running total
of the total number of applicants
'''
def clean_aamc_race_data(aamc_race_data):
	new_data = aamc_race_data
	

	for state in aamc_race_data:
		for appType in aamc_race_data[state]:
			race_info = recursively_default_dict()

			hispanics = []

			total = []
			hispanics.append(aamc_race_data[state][appType]["Cuban"])
			hispanics.append(aamc_race_data[state][appType]["Multiple Hispanic"])
			hispanics.append(aamc_race_data[state][appType]["Mexican American"])
			hispanics.append(aamc_race_data[state][appType]["Puerto Rican"])
			hispanics.append(aamc_race_data[state][appType]["Other Hispanic or Latino"])
			
			numHispanics = sum(map(int,hispanics))
			race_info["Hispanic"] = numHispanics
			total.append(numHispanics)
			race_info["Asian"] = int(aamc_race_data[state][appType]["Asian"])
			total.append(race_info["Asian"])
			race_info["NativeAmerican"] = int(aamc_race_data[state][appType]["American Indian or Alaska Native"])
			total.append(race_info["NativeAmerican"])
			race_info["Foreign"] = int(aamc_race_data[state][appType]["Foreign"])
			total.append(race_info["Foreign"])
			race_info["Black"] = int(aamc_race_data[state][appType]["Black or African American"])
			total.append(race_info["Black"])
			race_info["White"] = int(aamc_race_data[state][appType]["White"])
			total.append(race_info["White"])
			race_info["NativeHawaiian"] = int(aamc_race_data[state][appType]["Native Hawaiian or Other Pacific Islander"])
			total.append(race_info["NativeHawaiian"])
			race_info["Total"] = sum(map(int,total))
			aamc_race_data[state][appType] = race_info

	return aamc_race_data





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

def output_to_json(data, output_name):
	output = json.dumps(data)
	f = open(output_name, "wb")
	f.write(output)
	f.close()

	


'''
csv_data = csv_to_dict(aamc_filename)
coords_data = json_to_dict(coords_filename)
merged_data = merge_data(csv_data, coords_data)
output_to_json(merged_data)
'''

aamc_race_data = get_aamc_race_data(aamc_filename)
aamc_race_data = clean_aamc_race_data(aamc_race_data)
output_to_json(aamc_race_data, cleaned_aamc_filename)




