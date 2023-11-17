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
    "async": bool,
    "college": str,
    "courseCode": str,
    "courseName": str,
    "cvcId:": str,
    "endDay": int,
    "endMonth": int,
    "fulfillsGEs": list[str],
    "hasOpenSeats": bool,
    "hasPrereqs": bool,
    "instantEnrollment": bool,
    "mapToCourses": list[str],
    "niceToHaves": list[str],
    "pdfId": str,
    "startDay": int,
    "startMonth": int,
    "term": str,
    "tuition": int,
    "units": str
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
