import json
import re

import requests

def ge_list_to_categories(lis):
    res = []
    for string in lis:
        match = re.search('GE (.+):', string)
        print(match.group(1))
        roman = match.group(1)

        res.append(roman)

    return res


def get_ge_json():
    url = 'https://api-next.peterportal.org/v1/graphql'
    headers = {'content-type': 'application/json'}
    data = '{"query":"query ExampleQuery {\n  allCourses {\n    department\n    courseNumber\n    geList\n  }\n}"}'

    response = requests.post(url, headers=headers, data=data)
    res = response.text
    data = json.loads(res)

    courses = data['data']['allCourses']
    gen_eds = [course for course in courses if course['geList'] != []]

    result = {}
    for c in gen_eds:
        course_code = f'{c['department']} {c['courseNumber']}'
        result[course_code] = ge_list_to_categories(c['geList'])

    result_json = json.dumps(result, indent=2)
    with open('data/GEs_formatted.json', 'w') as f:
        f.write(result_json)

    return result_json


if __name__ == '__main__':
    get_ge_json()
