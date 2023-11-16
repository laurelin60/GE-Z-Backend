###
# Copyright 2023 Andrew W, Uno P, Kevin W, Alan T
#
# Made for WEBJAM 2023 at UC Irvine
###


import io
import json
import os.path
import re
from operator import itemgetter
from pathlib import Path

import cv2
import numpy as np
import pdf2image
from PIL.Image import Image
from PyPDF2 import PdfWriter, PdfReader, PageObject, Transformation
from pytesseract import pytesseract

if os.name == "posix":
    pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'
else:
    pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'


class Course:
    def __init__(self, course_id, name, units, notes=None):
        self.course_id = course_id
        self.name = name.replace('|', 'I')
        self.units = units

        self.notes = notes

    def __repr__(self):
        return f'Course({self.course_id}, {self.name}, {self.units})'
        # return self.course_id


class Or:
    def __init__(self, elements: list[Course, 'Or', 'And']):
        self.elements = elements

    def __repr__(self):
        res = "Or("
        for e in self.elements:
            res += e.__repr__() + ', '
        res += ")"

        return res

    def add_element(self, e):
        self.elements.append(e)


class And:
    def __init__(self, elements: list[Course, 'Or', 'And']):
        self.elements = elements

    def __repr__(self):
        res = "And("
        for e in self.elements:
            res += e.__repr__() + ', '
        res += ")"

        return res

    def add_element(self, e):
        self.elements.append(e)


def _get_courses(lis) -> list:
    if lis == ['']:
        return []

    courses = []

    for s in lis:
        course = _string_to_courses(s)
        if course:
            courses.append(course)

    return courses


def _string_to_courses(string) -> list[Course]:
    courses = []

    string = string.strip()
    # string = string.replace('\n', ' ')

    if '- And -' in string:
        return [Course('AND', '', '')]

    if '- Or -' in string:
        return [Course('OR', '', '')]

    matches = re.findall(' *([0-9A-Z ]+) - (.*?)[ \n]\(([0-9]+\.[0-9]+)\)', string, re.DOTALL)

    for m in matches:
        courses.append(Course(m[0], m[1], m[2]))

    return courses


def _is_course(string):
    matches = re.search(' *([0-9A-Z ]+) - (.*?)[ \n]\(([0-9]+\.[0-9]+)\)', string, re.DOTALL)
    return bool(matches)


def _get_subsection_text(subsection, debug, i) -> list[list[str]] | None:
    result = []

    left_section, mid_section, right_section = _split_sides(subsection)

    # if subsection is one to one articulation, header, or and/or
    if subsection.shape[0] < 150:
        mid_text = pytesseract.image_to_string(mid_section)

        # if subsection is one to one articulation
        if not mid_text:
            left_text = [pytesseract.image_to_string(left_section)]
            right_text = [pytesseract.image_to_string(right_section)]

            left_courses = _get_courses(left_text)
            right_courses = _get_courses(right_text)

            if left_courses and right_courses:
                result.append(left_courses)
                result.append(right_courses)

                return result

            return None

        # if subsection is header or and/or
        else:
            match = re.match('[ -]*(Or|And)[ -]*', mid_text)

            # if subsection is and/or
            if match:
                result.append(match.groups()[0])
                return result

    else:
        lines_left = _get_lines_formatted(left_section, 0.6, 10)
        lines_right = _get_lines_formatted(right_section, 0.6, 10)

        left_text = _get_subsection_side_text(left_section, lines_left)
        right_text = _get_subsection_side_text(right_section, lines_right)

        ###
        if debug:
            cv2.imwrite(f'debug/test/left_{i}.png', left_section)
            cv2.imwrite(f'debug/test/right_{i}.png', right_section)

            _draw_lines(left_section, f'debug/test/left_{i}_lines.png', lines_left)
            _draw_lines(right_section, f'debug/test/right_{i}_lines.png', lines_right)
        ###

        if not left_text or not right_text:
            return None

        left_courses = _get_courses(left_text)
        right_courses = _get_courses(right_text)

        if left_courses and right_courses:
            result.append(left_courses)
            result.append(right_courses)

            return result

    return None


def _get_subsection_side_text(section, lines) -> list[str]:
    if len(lines) == 2:
        text = [pytesseract.image_to_string(section)]
    else:
        subsections = _get_subsections(section, lines)

        text = []
        for subsection in subsections:
            section_text = pytesseract.image_to_string(subsection)

            if _string_to_courses(section_text):
                text.append(section_text)

    return text


def _draw_lines(image, save_path, lines, color=(20, 255, 70)) -> None:
    cv2.imwrite(save_path, image)
    debug_image = cv2.imread(save_path)

    for line in lines:
        x1, y1, x2, y2 = line
        cv2.line(debug_image, (x1, y1), (x2, y2), color, 5)

    cv2.imwrite(save_path, debug_image)


def _get_lines(image, min_length_multiplier, max_gap) -> np.ndarray:
    image_width = image.shape[1]
    image_edges = cv2.Canny(image, 40, 70)

    lines = cv2.HoughLinesP(
        image_edges,
        rho=1,
        theta=np.pi / 180,
        threshold=100,
        minLineLength=image_width * min_length_multiplier,
        maxLineGap=max_gap
    )

    return lines


def _get_horizontal_lines(lines):
    return [line[0] for line in lines if abs(line[0][1] - line[0][3]) < 5]


def _get_two_lines_crop_bounds(line1, line2):
    x1 = max(line1[0], line2[0])
    x2 = min(line1[2], line2[2])
    y1 = min(line1[1], line2[3])
    y2 = max(line1[1], line2[3])

    return x1, y1, x2, y2


def _get_lines_formatted(section, min_length_multiplier, max_gap):
    lines = _get_lines(section, min_length_multiplier, max_gap)
    horizontal_lines = _get_horizontal_lines(lines)

    horizontal_lines = [line for line in horizontal_lines if
                        line[1] > 5 and abs(line[1] - section.shape[0]) > 5]  # Remove lines at top and bottom

    if not any([True for line in horizontal_lines if line[1] < 50]):
        horizontal_lines.append(np.array([0, 0, section.shape[1], 0]))

    if not any([True for line in horizontal_lines if abs(line[1] - section.shape[0]) < 50]):
        horizontal_lines.append(np.array([0, section.shape[0], section.shape[1], section.shape[0]]))

    if len(horizontal_lines) < 2:
        raise ValueError('Splitting subsections failed, lines < 2')

    horizontal_lines.sort(key=itemgetter(1))

    return horizontal_lines


def _split_sides(subsection) -> tuple:
    crop_left = int(subsection.shape[1] * 0.48)
    crop_right = int(subsection.shape[1] * 0.52)

    left = subsection[:, :crop_left]
    mid = subsection[:, crop_left:crop_right]
    right = subsection[:, crop_right:]

    return left, mid, right


def _get_subsections(section, horizontal_lines):
    subsections = []

    for j in range(len(horizontal_lines) - 1):
        line1 = horizontal_lines[j]
        line2 = horizontal_lines[j + 1]

        if abs(line1[1] - line2[1]) < 50:
            continue

        x1, y1, x2, y2 = _get_two_lines_crop_bounds(line1, line2)

        subsection = section[y1:y2, x1:x2]
        subsections.append(subsection)

    return subsections


def _format_course_from(lis: list[Course | str]) -> list[Or | Course]:
    result = []
    for string in lis:
        if _is_course(string):
            result += _course_from_string(string)

    if len(result) < 2:
        return result

    my_or = Or([])

    for element in result:
        if isinstance(element, Course):
            my_or.add_element(element)

    return [my_or]


def _format_course_to(lis: list[Course | str]) -> list[And | Course]:
    result = []
    for string in lis:
        if _is_course(string):
            result += _course_from_string(string)

    if len(result) < 2:
        return result

    my_or = And([])

    for element in result:
        if isinstance(element, Course):
            my_or.add_element(element)

    return [my_or]


def _course_from_string(string) -> list[Course]:
    string = string.replace('\n', ' ')
    match = re.findall(' *([0-9A-Z ]+) - (.*?)[ \n]\(([0-9]+\.[0-9]+)\)', string)

    if match:
        return [Course(m[0], m[1], m[2]) for m in match]

    raise ValueError


def _transfer_to_dict(transfer_from: Course, transfer_to: Course) -> dict:
    res = {
        "from": {
            "code": transfer_from.course_id,
            "name": transfer_from.name,
            "units": transfer_from.units
        },
        "to": {
            "code": transfer_to.course_id,
            "name": transfer_to.name,
            "units": transfer_to.units
        }
    }

    return res


def _format_course_list(lis: list[str]) -> list[Course | str]:
    result = []
    for string in lis:
        if _is_course(string):
            result += _course_from_string(string)
        else:
            if 'And' in string:
                result.append('And')
            if 'Or' in string:
                result.append('Or')

    return result


class AssistParser:
    def __init__(self, pdf_path, debug=False):
        if not os.path.isfile(pdf_path):
            raise ValueError

        ###
        if debug:
            if not os.path.isdir('debug'):
                os.mkdir('debug')

                for d in ['lines', 'merged', 'recolored', 'sections', 'subsections', 'test']:
                    os.mkdir(f'debug/{d}')
        ###

        self.base_pdf_path: Path = Path(pdf_path)

        self.merged_pdf_image: Image = self.merge_pdf(debug=debug)
        self.recolored_image: np.ndarray = self.recolor_image(alpha=230, debug=debug)
        self.main_sections = self.split_sections_main(debug=debug)
        self.sub_sections = self.split_sections_sub(debug=debug)
        self.sub_sections_sides = self.get_subsections_sides(debug=debug)
        self.text_unformatted = self.get_sections_sides_sections(debug=debug)
        self.text_formatted = self.format_text()

        self.text_json = self.text_to_json()
        self.write_json()

    def merge_pdf(self, debug=False) -> Image:
        # print('MERGING', self.base_pdf_path)

        pdf_writer = PdfWriter()
        pdf_reader = PdfReader(open(self.base_pdf_path, 'rb'))

        base_width = pdf_reader.pages[0].mediabox.width
        base_height = pdf_reader.pages[0].mediabox.height
        num_pages = len(pdf_reader.pages)

        output_page = PageObject.create_blank_page(
            width=base_width / num_pages,
            height=base_height
        )

        vert = base_height

        if num_pages == 1:
            output_page = pdf_reader.pages[0]
            pdf_writer.add_page(output_page)
            bytes_out = io.BytesIO()
            pdf_writer.write(bytes_out)
            merged_image = pdf2image.convert_from_bytes(bytes_out.getvalue(), dpi=400 * num_pages)[0]

            return merged_image

        if num_pages > 2:
            vert += base_height * (num_pages - 2)

        for page in pdf_reader.pages:
            page.add_transformation(Transformation().translate(0, vert).scale(1 / num_pages))
            output_page.merge_page(page)

            vert -= (page.mediabox.height * 0.93)

        pdf_writer.add_page(output_page)

        bytes_out = io.BytesIO()
        pdf_writer.write(bytes_out)

        ###
        if debug:
            pdf_writer.write('debug/merged/merged.pdf')
        ###

        merged_image = pdf2image.convert_from_bytes(bytes_out.getvalue(), dpi=400 * num_pages)[0]

        return merged_image

    def recolor_image(self, alpha, debug=False) -> np.ndarray:
        # print('RECOLORING')
        img_array = np.array(self.merged_pdf_image.convert("L"))
        contrast_img_array = np.where(img_array > alpha, 255, 0).astype(np.uint8)

        if debug:
            cv2.imwrite('debug/recolored/recolored.png', contrast_img_array)

        return contrast_img_array

    def split_sections_main(self, debug=False) -> list[np.ndarray]:
        # print('SPLITTING MAIN SECTIONS')

        image_width = self.recolored_image.shape[1]

        lines = _get_lines(self.recolored_image, 0.88, 0)
        horizontal_lines = _get_horizontal_lines(lines)

        ###
        if debug:
            _draw_lines(self.recolored_image, 'debug/lines/lines.png', horizontal_lines)
        ###

        y_lis = [line[1] for line in horizontal_lines]
        y_lis.sort()

        y_lis = y_lis[10:]

        sections = []
        for i in range(len(y_lis) - 1):
            if y_lis[i + 1] - y_lis[i] < 50:
                continue

            crop_edge = int(0.055 * image_width)
            section = self.recolored_image[y_lis[i]:y_lis[i + 1], crop_edge:(-1 * crop_edge)]

            sections.append(cv2.cvtColor(section, cv2.COLOR_GRAY2BGR))

            ###
            if debug:
                cv2.imwrite(f'debug/sections/section_{i + 1}.png', section)
            ###

        return sections

    def split_sections_sub(self, debug=False):
        # print('SPLITTING SUBSECTIONS')

        subsections_total = []

        for i, section in enumerate(self.main_sections):
            horizontal_lines = _get_lines_formatted(section, 0.5, 10)

            subsections = _get_subsections(section, horizontal_lines)

            ###
            if debug:
                if not os.path.isdir(f'debug/subsections/{i}/'):
                    os.mkdir(f'debug/subsections/{i}/')
                    os.mkdir(f'debug/subsections/{i}/subsections')

                _draw_lines(section, f'debug/subsections/{i}/subsection_lines_{i}.png', horizontal_lines)

                for j, subsection_img in enumerate(subsections):
                    cv2.imwrite(f'debug/subsections/{i}/subsections/{j}.png', subsection_img)
            ###

            subsections_total.append(subsections)

        return subsections_total

    def get_subsections_sides(self, debug=False):
        """
        :return: list of list of tuples, sections of subsections of (l, m, r)
        """
        total = []

        for i, subsection in enumerate(self.sub_sections):
            subsection_result = []
            for j, img in enumerate(subsection):

                left, mid, right = _split_sides(img)
                subsection_result.append([left, mid, right])

                if debug:
                    if not os.path.isdir(f'debug/{i}/'):
                        os.mkdir(f'debug/{i}/')
                    cv2.imwrite(f'debug/{i}/{j}.png', img)
                    cv2.imwrite(f'debug/{i}/{j}_l.png', left)
                    cv2.imwrite(f'debug/{i}/{j}_m.png', mid)
                    cv2.imwrite(f'debug/{i}/{j}_r.png', right)

            total.append(subsection_result)

        return total

        # check lines on left/right
        # if lines > 2, read each subsection
        # else just read

        # ands and ors

    def get_sections_sides_sections(self, debug=False):
        final = []

        for i, subsections in enumerate(self.sub_sections_sides):
            section_final = []
            skip = False

            for sides in subsections:
                if skip:
                    continue

                left, mid, right = sides
                mid_text = pytesseract.image_to_string(mid)

                if left.shape[0] < 150:
                    if mid_text == '':
                        left_text = pytesseract.image_to_string(left)
                        right_text = pytesseract.image_to_string(right)

                        if not _is_course(left_text) or not _is_course(right_text):
                            continue

                        res = [[left_text], [right_text]]
                        section_final.append(res)

                        if debug:
                            print([left_text.__repr__()])
                            print(mid_text.__repr__())
                            print([right_text.__repr__()])

                    elif mid_text == '-Or -\n':
                        continue

                    else:
                        if debug:
                            print('SKIPPING', mid_text)
                        skip = True
                        section_final = []
                        continue

                else:
                    left_lines = _get_lines_formatted(left, 0.6, 10)
                    left_text = _get_subsection_side_text(left, left_lines)

                    right_lines = _get_lines_formatted(right, 0.6, 10)
                    right_text = _get_subsection_side_text(right, right_lines)

                    if not _is_course(left_text[0]) or not _is_course(right_text[0]):
                        continue

                    res = [left_text, right_text]
                    section_final.append(res)

                    if debug:
                        print(left_text.__repr__())
                        print(mid_text.__repr__())
                        print(right_text.__repr__())

            final += section_final

        return final

    def format_text(self):
        raw = self.text_unformatted

        formatted = []

        for pair in raw:
            transfer_to = pair[0]
            transfer_from = pair[1]

            # If multiple courses must be taken to articulate
            if '--- And ---\n' in transfer_from:
                continue

            formatted.append([_format_course_to(transfer_to), _format_course_from(transfer_from)])

        return formatted

    def text_to_json(self):
        text = self.text_formatted

        total_json = []

        for f in text:
            transfer_from = f[1][0]
            transfer_to = f[0][0]

            if isinstance(transfer_from, Course) and isinstance(transfer_to, Course):
                total_json.append(_transfer_to_dict(transfer_from, transfer_to))

            elif isinstance(transfer_from, Course) and isinstance(transfer_to, And):
                for t_course in transfer_to.elements:
                    total_json.append(_transfer_to_dict(transfer_from, t_course))

            elif isinstance(transfer_from, Or) and isinstance(transfer_to, Course):
                for t_course in transfer_from.elements:
                    total_json.append(_transfer_to_dict(t_course, transfer_to))

            elif isinstance(transfer_from, Or) and isinstance(transfer_to, And):
                for from_course in transfer_from.elements:
                    for to_course in transfer_to.elements:
                        total_json.append(_transfer_to_dict(from_course, to_course))

            else:
                raise ValueError

        return json.dumps(total_json, indent=2)

    def write_json(self):
        write_path = self.base_pdf_path.with_suffix('.json')
        print('WRITING', write_path)

        with open(write_path, "w") as f:
            f.write(self.text_json)

def main():
    for path in Path(r'C:\Users\awang\Downloads\uci-transfer-courses\output').rglob('*.pdf'):
        if os.path.isfile(path.with_suffix('.json')):
            continue

        AssistParser(path, debug=False)


if __name__ == '__main__':
    main()
