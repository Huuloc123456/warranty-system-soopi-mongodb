"""Nội dung slide thuyết trình đồ án Big Data (lấy từ báo cáo docs/BaoCao_DoAn_BigData.docx).

Chạy: python docs/slides/build/bigdata_spec.py  -> docs/slides/build/bigdata-slides.json
JSON được ghi dạng ASCII (\\uXXXX) để PowerShell 5.1 đọc đúng tiếng Việt.
"""
import json
from pathlib import Path

A = "docs\\slides\\assets-bigdata\\"

STRINGS = {
    "course": "NHẬP MÔN BIG DATA",
    "product": "XU HƯỚNG TIN TỨC",
    "tagline": "Phân tích xu hướng chủ đề từ tiêu đề video YouTube của các kênh báo, đài Việt Nam",
    "advisor": "GVHD: ThS. Ngô Dương Hà",
    "members": "Bùi Hữu Lộc (2001230467) · Đỗ Lê Thanh Mẫn (2001230510)",
    "thanks": "CẢM ƠN THẦY CÔ VÀ CÁC BẠN ĐÃ LẮNG NGHE!",
    "team": "Đề tài 5 — Phân tích xu hướng chủ đề trên mạng xã hội",
}

S = []


def section(n, title):
    S.append({"kind": "section", "number": n, "title": title})


def slide(layout, title="", notes="", **kw):
    S.append({"kind": "slide", "layout": layout, "title": title, "notes": notes, **kw})


slide("cover", notes="Giới thiệu nhóm, giảng viên hướng dẫn và tên đề tài.")
slide("agenda", items=["Giới thiệu đề tài", "Cơ sở lý thuyết", "Xây dựng ứng dụng, trực quan hóa dữ liệu",
                       "Kết luận và định hướng phát triển"],
      notes="Bài trình bày gồm bốn phần theo đúng cấu trúc báo cáo.")

# ---------------------------------------------------------------- Chương 1
section(1, "Giới thiệu đề tài")
slide("img-top", "Bài toán: hôm nay báo chí đang đưa tin về gì?",
      images=[{"path": A + "bang-diem.png", "alt": "Bảng chủ đề nổi bật ngày 14/10/2026 trên dashboard"}],
      cards=[["Vấn đề", ["Báo, đài Việt Nam đăng **hàng trăm video mỗi ngày** trên YouTube.",
                         "Cần biết theo ngày/tháng: chủ đề nào **nhiều video nhất**, chủ đề nào **tăng nhanh**, bao nhiêu kênh cùng đưa tin."]],
             ["Hướng giải quyết", ["Đề tài 5: thu thập, lưu HDFS/NoSQL, xử lý Spark, mô hình chủ đề, dashboard theo thời gian.",
                                   "Dữ liệu: **tiêu đề video YouTube** của các kênh báo, đài, có thời gian đăng và liên kết gốc."]]],
      notes="Nêu lý do chọn đề tài và lý do chọn nguồn dữ liệu YouTube của báo, đài Việt Nam. Hình là bảng chủ đề nổi bật ngày 14/10/2026 trên dashboard.")
slide("stats", "Mục tiêu và phạm vi",
      stats=[["104.790", "video hợp lệ"], ["30", "kênh báo, đài có dữ liệu"], ["136", "ngày đăng (01/06 – 14/10/2026)"],
             ["93.456", "tiêu đề dùng huấn luyện"]],
      cards=[["Mục tiêu", ["Pipeline chạy lại được: API → CSV → HDFS → Spark → MongoDB → dashboard.",
                           "So sánh Word2Vec + KMeans với LDA, chọn mô hình chính.",
                           "Thống kê chủ đề theo ngày/tháng, phát hiện khoảng tăng đột biến."]],
             ["Phạm vi", ["Chỉ dùng tiêu đề; không dùng bình luận, mô tả hay nội dung video.",
                          "Xử lý theo lô trên cụm Docker chạy trên một máy cá nhân.",
                          "Phân tích khám phá, không dự báo; kết quả là “chủ đề được đưa tin trong mẫu”."]]],
      notes="Nhấn mạnh quy mô dữ liệu và giới hạn diễn giải: mẫu theo kênh, không đại diện toàn bộ mạng xã hội.")

# ---------------------------------------------------------------- Chương 2
section(2, "Cơ sở lý thuyết")
slide("table-top", "Dữ liệu lớn và đặc trưng 5V trong đề tài",
      table=[["Đặc trưng", "Thể hiện trong đề tài"],
             ["Volume", "104.790 tiêu đề, mở rộng khi thêm kênh hoặc thêm thời gian"],
             ["Velocity", "Trung bình khoảng 773 video mới mỗi ngày"],
             ["Variety", "Văn bản, thời gian, mã kênh, liên kết, lượt xem, lượt thích"],
             ["Veracity", "12,31% thiếu lượt thích; nhận diện ngôn ngữ có thể sai; tiêu đề trùng"],
             ["Value", "Chuyển tiêu đề rời rạc thành chủ đề và xu hướng theo thời gian"]],
      items=["Big Data cần **lưu trữ phân tán** và **tính toán song song** khi dữ liệu vượt khả năng của một máy.",
             "Tệp CSV hiện khoảng 30 MB; HDFS và Spark được dùng để triển khai quy trình phân tán của môn học và sẵn sàng khi dữ liệu tăng."],
      notes="Đối chiếu 5V với dữ liệu thật của nhóm, nói rõ quy mô hiện tại vẫn nhỏ.")
slide("quad", "Công nghệ lưu trữ và xử lý phân tán",
      cards=[["HDFS", ["NameNode quản lý metadata, DataNode lưu block 128 MB.",
                       "Cụm đồ án: 1 NameNode, 2 DataNode, hệ số sao chép 2."]],
             ["Apache Spark", ["Driver điều phối, executor chạy song song; DataFrame + Catalyst, thực thi lười.",
                               "MLlib Pipeline dùng chung tiền xử lý lúc huấn luyện và suy luận."]],
             ["MongoDB", ["CSDL NoSQL hướng tài liệu (BSON), không cần schema cố định.",
                          "Lưu bảng kết quả nhỏ để dashboard đọc nhanh."]],
             ["Docker · Streamlit · Plotly", ["Docker Compose dựng toàn cụm bằng một lệnh.",
                                              "Streamlit + Plotly cho dashboard tương tác."]]],
      notes="Giải thích vai trò từng công nghệ trong kiến trúc, không đi sâu vào cài đặt.")
slide("compare", "Biểu diễn văn bản và mô hình chủ đề",
      cards=[["Word2Vec + KMeans (mô hình chính)", [
                  "Tiền xử lý: chữ thường, bỏ URL, chữ số, ký hiệu; tách token; bỏ từ dừng; lọc tiếng Việt bằng fastText.",
                  "Word2Vec 100 chiều → vector trung bình của tiêu đề → chuẩn hóa L2.",
                  "KMeans k = 10: mỗi tiêu đề thuộc **đúng một cụm** → đếm video theo ngày.",
                  "Nhãn cụm bằng **c-TF-IDF**: 3 từ đặc trưng nhất của cụm."]],
             ["LDA (mô hình bổ sung)", [
                  "CountVectorizer tạo vector tần suất từ.",
                  "Mỗi tài liệu là **hỗn hợp nhiều chủ đề**, mỗi chủ đề là phân phối trên từ vựng.",
                  "10 chủ đề, 30 vòng lặp, bộ tối ưu online.",
                  "Dùng trong trang Phân tích văn bản để xem phân bố mềm."]]],
      notes="So sánh gán cứng (KMeans) với phân bố mềm (LDA) và lý do cần cả hai.")
slide("compare", "Chỉ số đánh giá và phát hiện tăng đột biến",
      cards=[["Đánh giá mô hình", [
                  "**NPMI**: độ đồng xuất hiện chuẩn hóa của từ khóa, trong khoảng [-1, 1]; so sánh được cả hai mô hình.",
                  "**Silhouette** (cosine): mức tách biệt giữa các cụm KMeans.",
                  "**Log-perplexity**: khả năng dự đoán dữ liệu giữ lại của LDA (càng thấp càng tốt)."]],
             ["Xu hướng theo thời gian", [
                  "Tỷ trọng p(k, d) = số video cụm k / tổng video ngày d.",
                  "z = (p − μ) / max(σ, ε), so với trung bình 7 ngày trước.",
                  "Tăng đột biến khi **z > 2,5**, có ít nhất **20 video** và tỷ trọng ≥ **1,2 lần** mức nền."]]],
      notes="Nhấn mạnh: không có nhãn chuẩn nên không có độ chính xác; quy tắc tăng đột biến chỉ mang tính mô tả.")

# ---------------------------------------------------------------- Chương 3
section(3, "Xây dựng ứng dụng, trực quan hóa dữ liệu")
slide("img-top", "Kiến trúc tổng thể hệ thống",
      images=[{"path": A + "architecture.png", "alt": "Sơ đồ kiến trúc: API, thu thập, CSV, HDFS, Spark, MongoDB, dashboard"}],
      cards=[["Luồng dữ liệu", ["YouTube API → CSV → HDFS → Spark ETL/EDA → MLlib → tổng hợp xu hướng → MongoDB → dashboard."]],
             ["Môi trường", ["Hadoop 3.4.1 · Spark 3.5.3 (2 worker, 4 nhân, 4 GB mỗi worker) · MongoDB 7.0 · Streamlit 1.39."]]],
      notes="Đi theo mũi tên trên sơ đồ, mỗi tầng có đầu vào và đầu ra kiểm tra được.")
slide("table-top-img", "Thu thập dữ liệu bằng YouTube Data API v3",
      table=[["Bước", "Cách làm"],
             ["Danh mục nguồn", "32 kênh báo, đài; 30 kênh có dữ liệu"],
             ["Lấy mã video", "playlistItems.list theo danh sách tải lên, 50 mục/trang, checkpoint theo kênh"],
             ["Lấy metadata", "videos.list theo nhóm 50 mã: tiêu đề, lượt xem, lượt thích"],
             ["Loại trùng", "106.449 mã gốc → bỏ 1.659 tiêu đề trùng cùng kênh → 104.790 video"],
             ["Dữ liệu thiếu", "Không thiếu lượt xem; 12.896 dòng thiếu lượt thích (để trống)"]],
      images=[{"path": A + "hdfs-browse.png", "alt": "Tệp CSV gốc trên HDFS"}],
      items=[],
      notes="Giữ tiêu đề trùng ở các kênh khác nhau để phản ánh nhiều nguồn cùng đưa tin.")
slide("img-top", "Lưu trữ HDFS và cụm Spark",
      images=[{"path": A + "spark-master.png", "alt": "Spark Master với hai worker và các ứng dụng đã chạy"}],
      cards=[["HDFS", ["CSV gốc: **/social/raw/youtube_news** (28,68 MB, sao chép 2, block 128 MB).",
                       "Dữ liệu đã xử lý: **Parquet nén Snappy** tại /social/youtube_news (clean, models, sample_20)."]],
             ["Spark Master", ["**2 worker ALIVE**, mỗi worker 4 nhân, 4 GB.",
                               "Ứng dụng làm sạch, thống kê, huấn luyện hai mô hình, tổng hợp đều **FINISHED**."]]],
      notes="Có thể mở trực tiếp Spark UI cổng 8080 và HDFS cổng 9870 khi demo.")
slide("table-text", "Làm sạch và tách tập dữ liệu bằng Spark",
      table=[["Bước xử lý", "Loại bỏ", "Còn lại"],
             ["Kiểm tra schema, giá trị thiếu", "0", "104.790"],
             ["Trùng video_id, ngoài cửa sổ thời gian", "0", "104.790"],
             ["Tập thống kê (volume)", "–", "104.790"],
             ["Không phải tiếng Việt / độ tin cậy < 0,5", "11.323", "93.467"],
             ["Dưới 3 token sau khi bỏ từ dừng", "11", "93.456"],
             ["Tập huấn luyện (model)", "–", "93.456"]],
      items=["Ngày được tính theo **giờ Việt Nam** (UTC+7), không chỉ đổi nhãn hiển thị.",
             "**Tách hai tập**: thống kê giữ mọi video hợp lệ; huấn luyện chỉ giữ tiêu đề tiếng Việt đủ tin cậy.",
             "fastText nhận diện 90,5% tiêu đề là tiếng Việt; thời gian chạy ETL 50,3 giây."],
      notes="Giải thích vì sao không lọc ngôn ngữ trên tập thống kê.")
slide("stats", "Phân tích khám phá dữ liệu",
      stats=[["773", "video trung bình mỗi ngày"], ["583 – 920", "video ngày ít nhất – nhiều nhất"], ["84,1%", "tiêu đề dài 11–20 token"],
             ["4,59%", "video có hashtag"]],
      cards=[["Theo tháng", ["Tháng 6–9: khoảng 23,3–23,8 nghìn video mỗi tháng.",
                             "Tháng 10 có 10.664 video vì mới quan sát 14 ngày, không phải do giảm đưa tin."]],
             ["Từ và hashtag", ["Từ phổ biến “người”, “tin”, “báo”, “ngày” ít giá trị phân biệt → cần từ dừng theo miền.",
                                "Hashtag nhiều nhất là #shorts (2.447 video) — định dạng video, không phải chủ đề."]]],
      notes="Các số này dùng để chọn tham số tiền xử lý và giải thích giới hạn của hashtag.")
slide("table-text", "Huấn luyện và lựa chọn mô hình",
      table=[["Chỉ tiêu", "E01: Word2Vec + KMeans", "E02: LDA"],
             ["Số tài liệu", "93.456", "93.456"],
             ["Số cụm / chủ đề", "10", "10"],
             ["NPMI", "**0,2245**", "0,1492"],
             ["Silhouette", "0,1611", "–"],
             ["Log-perplexity", "–", "7,3048"],
             ["Thời gian chạy", "59,4 giây", "49,8 giây"]],
      items=["E01 có **NPMI cao hơn 0,0753** → chọn làm mô hình chính cho xu hướng.",
             "Silhouette 0,1611 còn thấp: tiêu đề ngắn, tách theo âm tiết, tên kênh lẫn vào tiêu đề.",
             "LDA giữ vai trò bổ sung trong phân tích văn bản mới."],
      notes="Hai lượt chạy trên toàn tập, cùng tiền xử lý, seed 42, 2 worker.")
slide("table-img", "Kết quả: 10 cụm chủ đề",
      table=[["Cụm", "Video", "Tỷ trọng", "NPMI"],
             ["thdt · công · học", "22.753", "21,71%", "0,0771"],
             ["hội · sĩ · liệt", "14.854", "14,18%", "0,1639"],
             ["iran · mỹ · nga", "14.347", "13,69%", "0,2920"],
             ["skđs · xe · tuổi", "14.292", "13,64%", "0,1604"],
             ["mưa · lũ · bão", "9.603", "9,16%", "0,2350"],
             ["tố · bắt · khởi", "8.804", "8,40%", "0,1976"],
             ["giá · vàng · news", "6.576", "6,28%", "0,1900"],
             ["tin · ngày · bản", "5.970", "5,70%", "0,1908"],
             ["tiết · thời · nay", "4.617", "4,41%", "0,4945"],
             ["cup · world · vtv", "2.972", "2,84%", "0,2436"]],
      images=[{"path": A + "cau-chuyen.png", "alt": "Trang Các câu chuyện trên dashboard"}],
      notes="Cụm rõ nghĩa: thời tiết, World Cup, mưa lũ, giá vàng, vụ án, quốc tế. Cụm lớn nhất còn rộng, nhãn bị ảnh hưởng bởi tên kênh (THDT, SKĐS).")
slide("img-top", "Xu hướng theo thời gian và tăng đột biến",
      images=[{"path": A + "dien-bien.png", "alt": "Cơ cấu tỷ trọng chủ đề theo ngày"}],
      cards=[["53 khoảng tăng đột biến", ["Nhiều nhất: “hội · sĩ · liệt” (8), “tin · ngày · bản” và “cup · world · vtv” (7 mỗi cụm)."]],
             ["Ví dụ", ["02/09: “hội · sĩ · liệt” 26,6% so với nền 16,0% · 12–13/09: “mưa · lũ · bão” 13,6% so với nền 7,5%."]]],
      notes="Tỷ trọng giúp tách thay đổi cơ cấu khỏi thay đổi tổng số video; muốn giải thích nguyên nhân phải đọc video gốc.")
slide("compare", "Đối chiếu một ngày: 14/10/2026",
      cards=[["Cụm “hội · sĩ · liệt”", [
                  "**105 video từ 28 kênh**, ngày trước 100 video.",
                  "Từ khóa trong ngày: táng, viếng, tiễn, điệu.",
                  "Ba video xem nhiều nhất đều về lễ truy điệu, an táng hài cốt liệt sĩ tại TP.HCM (199.170 · 178.097 · 107.929 lượt xem)."]],
             ["Giới hạn cần lưu ý", [
                  "105 video là của **cả cụm**, không phải 105 video cùng một sự kiện.",
                  "Cụm “mưa · lũ · bão” cùng ngày lẫn tin hố sụt ở Trung Quốc và tin tặc tấn công siêu thị ở Pháp.",
                  "Vì vậy dashboard luôn hiển thị **video gốc** để người dùng tự kiểm chứng."]]],
      notes="Ví dụ cho thấy cả điểm mạnh và giới hạn của chủ đề tự động.")
slide("img-text", "Dashboard trực quan hóa: 6 trang",
      images=[{"path": A + "phan-tich.png", "alt": "Trang Phân tích văn bản với một câu thử nghiệm"}],
      items=["**Bảng điểm**: chủ đề nhiều video nhất và tăng nhanh nhất theo ngày/tháng, kèm video minh họa.",
             "**Các câu chuyện**: quy mô, từ khóa và hồ sơ từng cụm.",
             "**Diễn biến**: tỷ trọng theo ngày, nhật ký tăng đột biến.",
             "**Từ khóa & Hashtag**: TF-IDF theo ngày, hashtag theo thời gian.",
             "**Phân tích văn bản**: câu “Bão số 5 gây mưa lớn…” → cụm mưa · lũ · bão (cosine 0,80).",
             "**Dữ liệu & Phương pháp**: phễu chất lượng dữ liệu, nguồn và chỉ số."],
      notes="Chuyển sang demo trực tiếp tại http://127.0.0.1:8501 nếu có thời gian.")

# ---------------------------------------------------------------- Chương 4
section(4, "Kết luận và định hướng phát triển")
slide("compare", "Kết quả đạt được và hạn chế",
      cards=[["Kết quả đạt được", [
                  "Pipeline hoàn chỉnh: 104.790 video, 30 kênh, 136 ngày.",
                  "Cụm HDFS + Spark + MongoDB chạy bằng Docker Compose.",
                  "So sánh hai mô hình, chọn Word2Vec + KMeans theo NPMI.",
                  "10 cụm, 53 khoảng tăng đột biến, dashboard 6 trang."]],
             ["Hạn chế", [
                  "Cụm chủ đề rộng hơn sự kiện cụ thể; silhouette còn thấp.",
                  "Mới thử k = 10; chưa có bigram, tách từ tiếng Việt hay đánh giá thủ công.",
                  "Chưa đo khả năng mở rộng; các node chạy trên một máy.",
                  "Chỉ có tiêu đề; lượt xem là số tích lũy tại một thời điểm."]]],
      notes="Trình bày trung thực các giới hạn đã ghi trong báo cáo.")
slide("quad", "Định hướng phát triển",
      cards=[["Chất lượng chủ đề", ["Tách từ tiếng Việt, bigram, loại tên kênh, thử nhiều giá trị k, đánh giá thủ công."]],
             ["Gom sự kiện", ["Gom video theo nội dung, thời gian, thực thể để đếm đúng một sự kiện."]],
             ["Thu thập định kỳ", ["Tự động quét lại kênh, lưu tương tác nhiều thời điểm, quản lý phiên bản."]],
             ["Mở rộng hệ thống", ["Chạy trên nhiều máy, đo khả năng mở rộng, thử Spark Structured Streaming."]]],
      notes="Ưu tiên cải thiện chất lượng nhận diện chủ đề trước khi mở rộng quy mô.")
slide("end", items=["Sẵn sàng demo dashboard, Spark UI và HDFS.",
                    "Mời thầy cô và các bạn đặt câu hỏi."],
      notes="Cảm ơn và mời đặt câu hỏi.")

out = Path(__file__).with_name("bigdata-slides.json")
out.write_text(json.dumps({"strings": STRINGS, "slides": S}, ensure_ascii=True, indent=1), encoding="ascii")
print(out, sum(1 for s in S), "slides")
