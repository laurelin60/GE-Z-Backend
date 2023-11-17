# GE-Z Backend

### About 

GE-Z: an assist.org and California Virtual Campus parser

Currently works for articulated courses from community colleges to UC Irvine
>Note: the parser does not guarantee 100% accuracy


### How to Use

Endpoint: `/api/cvc-courses?category=<category>`

Response: 
```json
[
  {
    "async": "bool",
    "college": "str, college name",
    "courseCode": "str",
    "courseName": "str",
    "cvcId:": "str, used to get cvc link",
    "endDay": "int",
    "endMonth": "int",
    "fulfillsGEs": "list[str], GEs fulfilled (can be multiple)",
    "hasOpenSeats": "bool",
    "hasPrereqs": "bool",
    "instantEnrollment": "bool",
    "mapToCourses": "list[str], all articulations from course",
    "niceToHaves": "list[str]",
    "pdfId": "str, used to get assist link",
    "startDay": "int",
    "startMonth": "int",
    "term": "str, string representatino of start & end dates",
    "tuition": "int",
    "units": "str"
  },
  {"...":  "..."}
]

```


### How it Works

PDF parsing is done in: `utils/assist_parser.py`
> run `parser_threaded.py` for multithreading

PDF parsing is done in these steps:
1. Conjoin PDFs into single PNG
2. Recolor PNG into pure black & white
3. Recursively detect text sections with OpenCV
4. In each section, ocr text with tesseract

JSON to SQLite database done through `app/populate_db.py`

To run the backend, run the Flask app at `app/app.py`


---
Made with ❤️ by Andrew Wang, Uno Pasadhika, Kevin Wu
