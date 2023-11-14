from PyPDF2 import Transformation, PdfReader, PdfWriter, PageObject


def merge_pdf_pages(input_pdf_path, output_pdf_path):
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

    with open(output_pdf_path, 'wb') as output_pdf_file:
        pdf_writer.write(output_pdf_file)

    print('PDF pages merged successfully.')


merge_pdf_pages('input/base.pdf', 'output.pdf')
