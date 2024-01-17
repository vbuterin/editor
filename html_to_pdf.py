from weasyprint import HTML
import sys, os
if len(sys.argv) < 3:
    print("Usage: python3 html_to_pdf.py input.md output.pdf")
else:
    HTML(
        string=open(sys.argv[1]).read(),
        base_url='file://{}/'.format(os.getcwd())
    ).write_pdf(sys.argv[2])
