from PyPDF2 import Transformation, PdfReader, PdfWriter, PageObject
from io import BytesIO

def merge_pdf_pages(input_pdf_path: str) -> bytes:
    pdf_writer = PdfWriter()

    pdf_reader = PdfReader(open(input_pdf_path, 'rb'))

    # If there's only one page, just return the original PDF content
    if len(pdf_reader.pages) == 1:
        return open(input_pdf_path, 'rb').read()

    output_page = PageObject.create_blank_page(
        width=pdf_reader.pages[0].mediabox.width / len(pdf_reader.pages),
        height=pdf_reader.pages[0].mediabox.height
    )

    vert = pdf_reader.pages[0].mediabox.height * (len(pdf_reader.pages) - 1)
    for page in pdf_reader.pages:
        page.add_transformation(Transformation().translate(0, vert).scale(1 / len(pdf_reader.pages)))
        output_page.merge_page(page)

        vert -= (page.mediabox.height - 57)

    output_page.scale(len(pdf_reader.pages), len(pdf_reader.pages)) # Restore size 

    pdf_writer.add_page(output_page)

    out = BytesIO()

    pdf_writer.write(out)

    # with open('testing.pdf', 'wb') as output_pdf_file:
    #     pdf_writer.write(output_pdf_file)

    return out.getvalue()




if (__name__ == "__main__"):
    print("This module isn't meant to be run as main")