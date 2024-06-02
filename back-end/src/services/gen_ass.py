import requests
from datetime import datetime, timedelta
from random import randrange
import json
from pymongo import MongoClient
from dotenv import dotenv_values

url = "http://localhost:5000/api/gpt"
headers = {"Content-Type": "application/json"}
users = ["tylerr"]
config = dotenv_values("../../.env")

def main():
    for user in users:
        #due_date = (datetime.now() + timedelta(days=randrange(1, 15))).strftime('%Y-%m-%d')
        #due_date = str(datetime.now() + timedelta( days=(randrange(14) + 1) )).split()[0]
        #print(due_date)
        #todays_date = datetime.now()
        #print(todays_date)

        # Define the JSON data
        data = {
            'prompt':
                '\
                Generate JSON data for a student taking 4 university courses, each with their own assignments.\
                Each course will have from 1 to 3 assignments due.\
                The assignments will be in the format\
                {"course_id": "<COURSE_ID_HERE>", "title": "<ASSIGNMENT_TITLE_HERE>", "due_date": "", "description": "<ASSIGNMENT_DESCRIPTION_HERE>", "user": "' + str(user) + '", "weight": <ASSIGNMENT_WEIGHT_HERE>}.\
                Do not change the "" of "due_date".\
                Additionally, the user variable is predefined. Each JSON output will be on a separate line. Do not include newlines (the "slash n") in between assignment JSONs.\
                Make specific assignment descriptions, at least 2 sentences each.\
                Create a short title for the assignment.\
                Also add a random weight to the assignment, as an integer, with a maximum of 25.\
                '
        }
        """
        'prompt': 'Generate JSON data for a single university course assignment. \
            It will have the format {"course_id": "<COURSE_ID_HERE>", "course_title": "<COURSE_TITLE_HERE>", \
            "due_date": "' + due_date + '", "description": "<COURSE_DESCRIPTION_HERE>", "user": "' + user + '"}. \
            Replace <COURSE_ID_HERE>, <COURSE_TITLE_HERE>, and <COURSE_DESCRIPTION_HERE> with randomly generated content. \
            Do not mess with the due_date or user portion.'
        """

        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            # Print the response content
            jsonresponse_raw = response.json()['response']

            jsonresponse_split_raw = jsonresponse_raw.split("{")
            json_response_split = []
            json_assignments = []
            for i in jsonresponse_split_raw:
                if i != "":
                    json_response_split.append("{" + i)

            for i in range(len(json_response_split)):
                due_date = (datetime.now() + timedelta(days=randrange(7, 22))).strftime('%Y-%m-%d')
                due_date = stringDateToEPOCMillis(due_date)
                e = json.loads(json_response_split[i])
                e["due_date"] = due_date
                json_assignments.append(e)

            for i in json_assignments:
                print(i)

            
            add_to_db(json_assignments)


        else:
            print("Error:", response.status_code)



def add_to_db(json_assigmnets):
    print("\n\n~ Adding jsons to database ~")
    try:
        # thank you https://pymongo.readthedocs.io/en/stable/examples/tls.html#troubleshooting-tls-errors
        # and https://www.mongodb.com/community/forums/t/serverselectiontimeouterror-ssl-certificate-verify-failed-trying-to-understand-the-origin-of-the-problem/115288
        client = MongoClient(config["PYMONGO_URL"], tls=True, tlsAllowInvalidCertificates=True)
        db = client['athena_database']
        collection = db['assignment_data']

        for assignment in json_assigmnets:
            collection.insert_one(assignment)

        print("Successfully added assignments to DB")
        
    except Exception as e:
        print("Failed to add assignment to DB: ", e)

def stringDateToEPOCMillis(date_str):
    # Convert the string date to a datetime object
    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
    
    # Convert the datetime object to a Unix timestamp in milliseconds
    epoch_millis = int(date_obj.timestamp() * 1000)
    
    return epoch_millis

if __name__ == '__main__':
    main()