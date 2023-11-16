import json
import os
from pathlib import Path


def _validate_json(path):
    with open(path, 'r') as f:
        data = json.loads(f.read())

    articulations = data['Articulations']

    for a in articulations:
        from_code: str = a["from"]["code"]
        to_code: str = a["to"]["code"]

        if len(from_code) < 5 or len(to_code) < 5:
            print(path)
            print(from_code)
            print(to_code)

        # if to_code.startswith('C SCI'):
        #     print(path)
        #     print(from_code)
        #     print(to_code)


def validate(directory_path):
    for path in Path(directory_path).rglob('*.json'):

        json_path = path.with_suffix('.json')

        if os.path.isfile(json_path):
            _validate_json(json_path)


if __name__ == '__main__':
    validate(r'C:\Users\awang\Downloads\transfer-courses-new-half')
