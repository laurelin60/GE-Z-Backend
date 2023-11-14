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
import io
from typing import List 

def merge_pdf_pages(input_pdf_path: str) -> bytes:
    pdf_writer = PdfWriter()

    pdf_reader = PdfReader(open(input_pdf_path, 'rb'))

    output_page = PageObject.create_blank_page(
        width=pdf_reader.pages[0].mediabox.width / 2,
        height=pdf_reader.pages[0].mediabox.height
    )

    vert = pdf_reader.pages[0].mediabox.height
    for page in pdf_reader.pages:
        page.add_transformation(Transformation().translate(0, vert).scale(1 / len(pdf_reader.pages)))
        output_page.merge_page(page)

        vert -= (page.mediabox.height - 57)

    pdf_writer.add_page(output_page)

    out = io.BytesIO()

    pdf_writer.write(out)

    return out.getvalue()

def recolor(merged_pdf_data: bytes, alpha: int) -> np.ndarray:
    # Store Pdf with convert_from_path function
    images = convert_from_bytes(merged_pdf_data, dpi=1200)
    img_array = np.array(images[0].convert("L"))

    # Apply NumPy operations to the entire image array
    new_img_array = np.where(img_array > alpha, 255, 0).astype(np.uint8)

    return new_img_array

def detect_horizontal_lines(image: np.ndarray) -> List[np.ndarray]:
    # Read the image
    image_width = image.shape[1]

    # Use Canny edge detector to find edges with stricter parameters
    edges = cv2.Canny(image, 20, 40)  # Adjust these thresholds

    # Use HoughLinesP to detect lines with stricter parameters
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=image_width * 0.89, maxLineGap=0)

    horizontal_lines = [line[0] for line in lines if abs(line[0][1] - line[0][3]) < 5]  # Adjust the threshold as needed

    y_lis = []
    # Draw the detected lines on the original image
    for line in horizontal_lines:
        y_lis.append(line[1])
        x1, y1, x2, y2 = line
        cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 5)

    # cv2.imwrite('lines.png', image) # We don't need these files in AIO 

    y_lis.sort()

    res = []

    for i in range(len(y_lis) - 1):
        if y_lis[i + 1] - y_lis[i] < 50:
            continue

        crop_edge = int(0.05 * image_width)
        section = image[y_lis[i]:y_lis[i + 1], crop_edge:(-1 * crop_edge)]
        res.append(cv2.cvtColor(section, cv2.COLOR_GRAY2BGR))
        
        # cv2.imwrite(f'sections/section_{i + 1}.png', section)
    return res

# Set the path to the Tesseract executable (change this path to match your installation)
pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract' if os.name == "posix" else r'C:\Program Files\Tesseract-OCR\tesseract.exe'
custom_config = r'--psm 4'

cases = {
    '€<—': '<-',
    '€—': '<-',
    '11&': 'I&',
    '1&': 'I&',
    'I8&': 'I&',
    '!': 'I',
}


def reformat_text(text):
    for k, v in cases.items():
        text = text.replace(k, v)
    return text

def split_img(img):
    """Splits a section into left (articulated), middle (arrow), and right (articulates)"""
    crop_left = int(img.shape[1] * 0.48)
    crop_right = int(img.shape[1] * 0.52)

    left = img[:, :crop_left]
    mid = img[:, crop_left:crop_right]
    right = img[:, crop_right:]

    return left, mid, right


def get_text(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cv2.imwrite('asdf.png', gray) # Used to be blurred instead of gray 
    text = pytesseract.image_to_string(gray, config=custom_config) # Used to be blurred instead of gray 

    return text


def get_lines(img):
    image_width = img.shape[1]

    # Use Canny edge detector to find edges with stricter parameters
    edges = cv2.Canny(img, 90, 100)  # Adjust these thresholds

    # Use HoughLinesP to detect lines with stricter parameters
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=10, minLineLength=image_width * 0.8,
                            maxLineGap=10)

    y_lis = []

    if (lines is not None):
        horizontal_lines = [line[0] for line in lines if abs(line[0][1] - line[0][3]) < 5]

        # Draw the detected lines on the original image
        for line in horizontal_lines:
            y_lis.append(line[1])
            x1, y1, x2, y2 = line
            cv2.line(img, (x1, y1), (x2, y2), (0, 255, 0), 2)

        y_lis.sort()
    return y_lis


def get_sections_text(img):
    res = []
    y_lis = get_lines(img)
    y_lis.append(img.shape[0])
    y_lis.sort()

    if len(y_lis) < 4:
        return [get_text(img)]

    for i in range(len(y_lis) - 1):
        section = img[y_lis[i]:y_lis[i + 1], :]

        text = get_text(section)
        if text:
            text = reformat_text(text)
            res.append(text)

    return res

def extract_thread(image):

    left, mid, right = split_img(image)

    text_mid = get_sections_text(mid)

    if text_mid != ['']:
        if not text_mid == ['-Or-\n']:
            return

    text_l = get_sections_text(left)
    text_r = get_sections_text(right)

    if text_l == text_r == ['']:
        return

    if text_l and text_r:
        print(text_l)
        print(text_mid)
        print(text_r)
        print()

def extract_text_from_image_data(images):
    threads = []
    for image in images:
        # extract_thread(image)
        threads.append(threading.Thread(target = extract_thread, args = (image,)))
        threads[-1].start()
    for t in threads:
        t.join()

if (__name__ == "__main__"):
    stt = time.time()
    print("Merging PDF files...")
    merged_pdf = merge_pdf_pages('base.pdf')
    print("Recoloring...")
    recolored = recolor(merged_pdf, 230)
    print("Detecting lines...")
    split_image_sections = detect_horizontal_lines(recolored)
    print("Running OCR...")
    extract_text_from_image_data(split_image_sections)
    print("Elapsed: " + str((time.time() - stt)) + " seconds")