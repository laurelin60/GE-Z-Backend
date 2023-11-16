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


with open('GEs.json') as f:
    data = json.loads(f.read())

courses = data['data']['allCourses']
gen_eds = [d for d in courses if d['geList']]

result = {}

for c in gen_eds:
    course_code = f'{c['department']} {c['courseNumber']}'
    result[course_code] = ge_list_to_ints(c['geList'])

with open('GEs_formatted.json', 'w') as f:
    f.write(json.dumps(result, indent=2))
