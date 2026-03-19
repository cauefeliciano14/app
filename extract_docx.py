import zipfile
import xml.etree.ElementTree as ET

def extract_text_from_docx(docx_path):
    with zipfile.ZipFile(docx_path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for p in tree.iter(f'{{{ns["w"]}}}p'):
            para_text = "".join([node.text for node in p.iter(f'{{{ns["w"]}}}t') if node.text])
            if para_text:
                text.append(para_text)
        return "\n".join(text)

text = extract_text_from_docx('c:/Users/cauef/OneDrive/Documents/App/react-app/source/player_handbook_2024.docx')
with open('c:/Users/cauef/OneDrive/Documents/App/react-app/source/docx_text.txt', 'w', encoding='utf-8') as f:
    f.write(text)
print("Extracted text to source/docx_text.txt")
