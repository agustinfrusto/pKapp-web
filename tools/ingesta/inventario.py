import sys
import os
from pathlib import Path
import fitz  # PyMuPDF

def analizar_pdf(pdf_path: Path):
    doc = fitz.open(str(pdf_path))
    total_pages = len(doc)
    total_text_chars = 0
    total_highlights = 0
    highlight_pages = []
    
    # Text search for answer table at the end
    has_answer_section = False
    answer_keywords = ['clave', 'respuestas', 'tabla de respuestas', 'plantilla', 'solucionario', 'correcta']
    
    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text()
        total_text_chars += len(text)
        
        # Check annotations
        annots = page.annots()
        if annots:
            for annot in annots:
                # 8 is HIGHLIGHT in PDF annot subtype enum
                if annot.type[0] == 8 or annot.type[1] == 'Highlight':
                    total_highlights += 1
                    if page_num + 1 not in highlight_pages:
                        highlight_pages.append(page_num + 1)
        
        # Check last 2 pages for answer key table
        if page_num >= total_pages - 2:
            lower_text = text.lower()
            if any(kw in lower_text for kw in answer_keywords):
                has_answer_section = True

    avg_chars_per_page = total_text_chars / max(total_pages, 1)
    is_selectable_text = avg_chars_per_page > 200

    # Determine format
    formato = "desconocido"
    if total_highlights >= 10:
        formato = "highlight"
    elif has_answer_section:
        formato = "apartado"
    elif total_highlights > 0:
        formato = "highlight_parcial"

    doc.close()
    return {
        "archivo": pdf_path.name,
        "paginas": total_pages,
        "caracteres_total": total_text_chars,
        "promedio_chars_pag": round(avg_chars_per_page, 1),
        "texto_seleccionable": is_selectable_text,
        "total_anotaciones_highlight": total_highlights,
        "paginas_con_highlight": highlight_pages,
        "seccion_respuestas_final": has_answer_section,
        "formato_detectado": formato,
    }

def inventariar_directorio(dir_path: Path):
    pdfs = sorted(list(dir_path.glob("*.pdf")) + list(dir_path.glob("*.PDF")))
    resultados = []
    
    for p in pdfs:
        try:
            res = analizar_pdf(p)
            resultados.append(res)
        except Exception as e:
            resultados.append({
                "archivo": p.name,
                "error": str(e),
                "formato_detectado": "error_lectura"
            })
            
    return resultados

if __name__ == '__main__':
    dir_to_scan = Path('/Users/usuario/Documents/ESFUNO/4 - Cardiovascular y Respiratorio/Examenes')
    if len(sys.argv) > 1:
        dir_to_scan = Path(sys.argv[1])
        
    print(f"Analizando corpus en: {dir_to_scan}\n")
    res = inventariar_directorio(dir_to_scan)
    
    for r in res:
        print(f"📄 {r['archivo']}")
        if "error" in r:
            print(f"   ERROR: {r['error']}")
        else:
            print(f"   Páginas: {r['paginas']} | Chars/pág: {r['promedio_chars_pag']} | Texto nativo: {r['texto_seleccionable']}")
            print(f"   Highlights (anotaciones): {r['total_anotaciones_highlight']} en págs {r['paginas_con_highlight']}")
            print(f"   Apartado respuestas final: {r['seccion_respuestas_final']}")
            print(f"   ➡️ FORMATO CLASIFICADO: {r['formato_detectado']}")
        print("-" * 60)
