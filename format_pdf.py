import fitz

def format_pdf():
    input_path = r"C:\Users\Vipul\OneDrive\Desktop\Hospital_Management_DC_Report.pdf"
    output_path = r"C:\Users\Vipul\OneDrive\Desktop\Hospital_Management_DC_Report_Formatted.pdf"

    doc = fitz.open(input_path)

    font_calibri = fitz.Font(fontfile=r"C:\Windows\Fonts\calibri.ttf")
    font_calibri_it = fitz.Font(fontfile=r"C:\Windows\Fonts\calibrii.ttf")

    # 1. Update Table of Contents on page 3 (index 2)
    p3 = doc[2]
    # Exact coordinates of the old page numbers
    toc_replacements = [
        (fitz.Rect(455, 301, 485, 318), "11"),
        (fitz.Rect(455, 322, 485, 339), "16"),
        (fitz.Rect(455, 343, 485, 360), "26"),
        (fitz.Rect(455, 364, 485, 381), "26"),
        (fitz.Rect(455, 385, 485, 403), "27"),
        (fitz.Rect(455, 406, 485, 424), "27"),
        (fitz.Rect(455, 427, 485, 445), "28"),
    ]

    for rect, _ in toc_replacements:
        p3.add_redact_annot(rect, fill=(1, 1, 1))
    p3.apply_redactions()

    for rect, new_text in toc_replacements:
        # insert text using Calibri 11pt
        p3.insert_font(fontname="calibri", fontbuffer=font_calibri.buffer)
        p3.insert_text(fitz.Point(464.6, rect.y1 - 3.5), new_text, fontname="calibri", fontsize=11.04, color=(0, 0, 0))

    # 2. Update Figure captions (Fix numbering gap: Fig 5..16 -> Fig 3..14)
    fig_mapping = [
        (15, "Figure 5: Load balancer log - requests spread over the workers",
             "Figure 3: Load balancer log - requests spread over the workers"),
        (16, "Figure 6: Client output - Lamport clock of each request",
             "Figure 4: Client output - Lamport clock of each request"),
        (17, "Figure 7: Peer nodes requesting the critical section at the same time",
             "Figure 5: Peer nodes requesting the critical section at the same time"),
        (17, "Figure 8: Circular wait between bed and doctor resources (Wait-For-Graph)",
             "Figure 6: Circular wait between bed and doctor resources (Wait-For-Graph)"),
        (18, "Figure 9: Deadlock without detection - circular wait",
             "Figure 7: Deadlock without detection - circular wait"),
        (18, "Figure 10: Deadlock detection aborts Node 2",
             "Figure 8: Deadlock detection aborts Node 2"),
        (19, "Figure 11: Concurrent writes on replicas converge to one value",
             "Figure 9: Concurrent writes on replicas converge to one value"),
        (20, "Figure 12: Cache miss, cache hit, Redis failure and database failure",
             "Figure 10: Cache miss, cache hit, Redis failure and database failure"),
        (21, "Figure 13: Leader election and failover after the leader crashes",
             "Figure 11: Leader election and failover after the leader crashes"),
        (22, "Figure 14: Raft pods and the concurrent load-test Job",
             "Figure 12: Raft pods and the concurrent load-test Job"),
        (23, "Figure 15: A DICOM scan stored as replicated 64 KB chunks",
             "Figure 13: A DICOM scan stored as replicated 64 KB chunks"),
        (23, "Figure 16: Read after chunk server failure, checksum verification and repair",
             "Figure 14: Read after chunk server failure, checksum verification and repair"),
    ]

    for pno, old_cap, new_cap in fig_mapping:
        page = doc[pno]
        rects = page.search_for(old_cap.strip())
        if not rects:
            prefix = old_cap.split(":")[0] + ":"
            rects = page.search_for(prefix)
        
        if rects:
            r = rects[0]
            # Redact the old caption
            redact_r = fitz.Rect(r.x0 - 5, r.y0 - 2, r.x1 + 5, r.y1 + 2)
            page.add_redact_annot(redact_r, fill=(1, 1, 1))
            page.apply_redactions()

            page.insert_font(fontname="calibri-it", fontbuffer=font_calibri_it.buffer)
            text_len_new = font_calibri_it.text_length(new_cap, fontsize=10.56)
            start_x = (page.rect.width - text_len_new) / 2.0
            page.insert_text(fitz.Point(start_x, r.y1 - 1.5), new_cap, fontname="calibri-it", fontsize=10.56, color=(0, 0, 0))
            print(f"Page {pno+1}: Replaced caption -> {new_cap}")
        else:
            print(f"Warning: not found on page {pno+1}: {old_cap}")

    doc.save(output_path)
    print("SUCCESS: Saved formatted PDF to", output_path)

if __name__ == "__main__":
    format_pdf()
