from PIL import Image
from pdf2image import convert_from_bytes
import numpy as np
import cv2

def recolor(merged_pdf_data: bytes, alpha: int) -> np.ndarray:
    Image.MAX_IMAGE_PIXELS = 500000000  
    images = convert_from_bytes(merged_pdf_data, dpi=900)
    img_array = np.array(images[0].convert("L")) 
    new_img_array = np.where(img_array > alpha, 255, 0).astype(np.uint8)

    return new_img_array

if (__name__ == "__main__"):
    print("This module isn't meant to be run as main")