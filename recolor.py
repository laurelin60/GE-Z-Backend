import numpy as np
from PIL import Image
from pdf2image import convert_from_path


def recolor(in_path, out_path, alpha):
    # Store Pdf with convert_from_path function
    images = convert_from_path(in_path, dpi=1200)
    img_array = np.array(images[0].convert("L"))

    # Apply NumPy operations to the entire image array
    new_img_array = np.where(img_array > alpha, 255, 0).astype(np.uint8)

    # Convert NumPy array back to PIL Image
    new_image = Image.fromarray(new_img_array)

    new_image.save(out_path, "PNG", resolution=100.0)


recolor('output/output.pdf', 'output/output.png', 230)
