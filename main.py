from PyPDF2 import Transformation, PdfReader, PdfWriter, PageObject
from PIL import Image
from pdf2image import convert_from_bytes
import numpy as np
import cv2
import os.path
import numpy as np
import pytesseract
import time
import threading
from pathlib import Path
from termcolor import colored

# Custom SDK imports 
from pdfmerger import merge_pdf_pages
from recolor import recolor
from lines import detect_horizontal_lines
from ocr import extract_text_from_image_data

THREAD_COUNT = 128

def processPdf(pdfPath: str, fileNum: int, fileCount: int):
    merged_pdf = merge_pdf_pages(pdfPath)
    recolored = recolor(merged_pdf, 230)
    split_image_sections = detect_horizontal_lines(recolored)
    extract_text_from_image_data(split_image_sections)
    # Print message when done processing this file
    print("[" + colored(str(fileNum + 1) + "/" + str(fileCount), 'light_blue') + "] Processed " + colored(str(f).split('\\')[2], 'green') + " from " + colored(str(f)[6:].split('\\')[0].replace('_', ' '), 'cyan'))


if (__name__ == "__main__"):
    
    stt = time.time()
    print("Merging PDF files...")
    merged_pdf = merge_pdf_pages('./input/Allan_Hancock_College/Aerospace_Engineering__B_S_.pdf') # needs work # ./input/Allan_Hancock_College/Accounting__Minor_in_.pdf
    print("Recoloring...")
    recolored = recolor(merged_pdf, 230)




    # save image to test 
    new_image = Image.fromarray(recolored)

    new_image.save("testing.png", "PNG", resolution=100.0)



    print("Detecting lines...")
    split_image_sections = detect_horizontal_lines(recolored)
    print("Running OCR...")
    extract_text_from_image_data(split_image_sections)
    print("Elapsed: " + str((time.time() - stt)) + " seconds")
    
    """
    fileCount = sum(1 for _ in Path("./input").glob("**/*.pdf"))
    stt = time.time()
    print("Found " + str(fileCount) + " file(s), starting super crazy epic processing thingy...")
    # Start processing 
    threads = []
    for i, f in enumerate(Path("./input").glob("**/*.pdf")):
        processPdf(str(f), i, fileCount)
        #threads.append(threading.Thread(target = processPdf, args = (str(f), i, fileCount)))
        #threads[-1].start()
        
    for t in threads:
        t.join()
    
    print("Finished processing " + str(fileCount) + " file(s) in " + colored(str(round((time.time() - stt), 2)), 'yellow') + " seconds")
    """
    