import cv2
import numpy as np


def detect_horizontal_lines(image_path):
    # Read the image
    image = cv2.imread(image_path)
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

    cv2.imwrite('lines.png', image)

    y_lis.sort()

    image = cv2.imread(image_path)

    for i in range(len(y_lis) - 1):
        if y_lis[i + 1] - y_lis[i] < 50:
            continue

        crop_edge = int(0.05 * image_width)
        section = image[y_lis[i]:y_lis[i + 1], crop_edge:(-1 * crop_edge)]

        cv2.imwrite(f'sections/section_{i + 1}.png', section)


image_path = 'output.png'
detect_horizontal_lines(image_path)
