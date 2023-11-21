# GE-Z Backend

### Refactor in progress, the initial version was time-constrained (for WebJam) and we are rebuilding the backend
>You can view the version submitted to WebJam [here](../../tree/a6de9cdc4de2bbde49d89e6c9b6d760331286244). (Technically this is one commit after we presented, but the only thing added was the pitch slides pdf)

## About 

GE-Z: an assist.org and California Virtual Campus parser.

Currently works for articulated courses from community colleges to UC Irvine
>Note: the parser does not guarantee 100% accuracy. If you run into issues please let us know :+1:


## How to Use API

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
    "term": "str, string representation of start & end dates",
    "tuition": "int",
    "units": "str"
  },
  {"...":  "..."}
]

```


## How to Run

### 1. Web Scraping

* Run:
  * `scrapers/cvc-scraper.js` - California Virtual Campus scraping
  * `scrapers/assist-scraper.js` - Assist.org scraping


* Result:
  * JSON of available CVC courses 
  * Directory of all transfer agreement PDFs, grouped by college

### 2. PDF Parsing

* Run
  * `utils/assist_parser.py` - Transfer agreement PDF parser
  *  or `utils/parser_threaded.py` for multithreading
> We are replacing the Python parsers with a single Node.js script (you can take a look at `assist parser/textpdfparse.js`), but at the moment the output formats are different 
  

* Result
  * JSON text data, stored in the same path as each PDF
  
> Note on how the PDF parser works: 
> 1. Join PDF pages into single vertical PNG
> 2. Recolor PNG into binary black & white
> 3. Recursively detect text sections with OpenCV line detection
> 4. In each section, perform ocr on text with pytesseract
> 5. Format text into JSON


### 3. SQL Database Population & Backend

* Run
  * `app/populate_db.py` - Database populator
  * `app/app.py` - Flask backend


* Result
  * A fully built SQL database
  * A running backend api

> Tip: access an admin panel for the database through the `/admin` route


---
Made with ❤️ by Andrew Wang, Uno Pasadhika, Kevin Wu
