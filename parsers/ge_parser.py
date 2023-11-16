import json
import re
import requests

d = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6,
    "VII": 7,
    "VIII": 8
}


def ge_list_to_ints(lis):
    res = []
    for string in lis:
        match = re.search('GE ([IV]+)', string)
        roman = match.groups()[0]

        res.append(d[roman])

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
        result[course_code] = ge_list_to_ints(c['geList'])

    with open('GEs_formatted.json', 'w') as f:
        print('WRITING GE JSON')
        f.write(json.dumps(result, indent=2))


get_ge_json()