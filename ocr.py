import os.path

import cv2
import numpy as np
import pytesseract
import time
import threading

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

def extract_thread(images_path, f):
    image = cv2.imread(os.path.join(images_path, f))

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

def extract_text_from_sections(images_path):
    files = os.listdir(images_path)
    files.sort()
    threads = []
    for f in files:
        threads.append(threading.Thread(target = extract_thread, args = (images_path, f)))
        threads[-1].start()
    for t in threads:
        t.join()


stt = time.time()
# Call the function to extract text from sections
extract_text_from_sections('sections')
print("Elapsed: " + str((time.time() - stt)) + " seconds")