// ==UserScript==
// @name         Facebook Dashboard Magic V23 (Fix Comments & Charts)
// @namespace    http://tampermonkey.net/
// @version      23.0
// @description  Sửa % âm, Sửa số comment (3 -> 4.890), Vẽ biểu đồ
// @author       Bạn
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const MY_LINE_D = "M97,94.798983L118.29918981481481,90.643335080685446L141.59837962962962,112.35746825032469L164.89756944444446,50L188.19675925925924,100.62371037386001L211.49594907407408,98.97202L234.79513888888889,115.875652135000635L258.0943287037037,104.826225981094105L281.3935185185185,104.772949L304.69270833333337,111.59507649596334L327.99189814814815,118.39961595916252L351.29108796296293,118.19520415772672L374.59027777777777,92.56627714986752L397.8894675925926,102.61364149270452L421.1886574074074,115.318815L444.48784722222223,107.10812670374264L467.787037037037,115.50913360672507L491.08622685185185,98.16677730091484L514.3854166666666,88.1311050034729L537.6846064814815,80.37989194168384L570.9837962962963,79.03308903110863L584.2829861111111,63.337760883734L607.5821759259259,64.984375L630.8813657407406,57.90024534786085L654.1805555555555,85.00072892235454L677.4797453703704,93.848766L700.7789351851851,90.13253750017842L724.078125,93.77679172474654";
    const MY_FILL_D = MY_LINE_D + " L724.078,183 L97,183 Z";
    // ==================================================================
    // 1. CẤU HÌNH PHẦN TRĂM (Sửa các số % màu đỏ/xám)
    // ==================================================================
    const TARGET_PERCENTS = [
    {
        targetText: "-86%",
        newText: "+18%",
        newColor: "#31A24C",
        direction: "len"      // mũi tên xoay lên (mặc định)
    },
    {
        targetText: "-95%",
        newText: "-5%",
        newColor: "#ff7c74",  // đỏ vì là số âm
        direction: "xuong"    // mũi tên giữ nguyên chỉ xuống
    },
];
const COLORS = {
        chartLine: "#1877F2",        // Xanh dương Facebook (Blue)
        chartFill: "rgba(24, 119, 242, 0.15)", // Nền xanh dương mờ
        textGrowth: "#31A24C"        // Chữ +5% vẫn để xanh lá (biểu thị tăng trưởng)
    };
    // ==================================================================
    // 2. CẤU HÌNH SỐ TO (Lượt xem, Comment...)
    // ==================================================================
    const BIG_NUMBERS = [
        {
            old: "10.148.910", // Số lượt xem CŨ (đang hiện trên màn hình)
            new: "56.640.567" // Số lượt xem MỚI
        },
        {
            old: "2.185",         // Số comment CŨ (đang hiện trên màn hình)
            new: "6.042"      // Số comment MỚI
        },
        {
            old: "83",         // Số comment CŨ (đang hiện trên màn hình)
            new: "235"      // Số comment MỚI
        },
      
    ];

    // ==================================================================
    // HÀM 1: SỬA SỐ TO (Chạy độc lập để đảm bảo thay đổi được số 3)
    // ==================================================================
    function fixBigNumbers() {
        // Tìm tất cả các thẻ span có thuộc tính dir="auto" (theo HTML bạn gửi)
        const spans = document.querySelectorAll('span[dir="auto"]');

        spans.forEach(span => {
            const text = span.textContent.trim();

            // Duyệt qua danh sách cấu hình số to
            BIG_NUMBERS.forEach(conf => {
                // Kiểm tra chính xác tuyệt đối để tránh thay nhầm số 3 ở chỗ khác (vd: 3 giờ trước)
                if (text === conf.old || text === conf.new) {
                    if (text !== conf.new) {
                        span.textContent = conf.new;
                        // Thêm chút style để đảm bảo nó không bị lỗi font
                        span.style.display = "inline-block";
                    }
                }
            });
        });
    }

    // ==================================================================
    // HÀM 2: SỬA PHẦN TRĂM & ICON
    // ==================================================================
   function fixPercentages() {
    const spans = document.querySelectorAll('span[dir="auto"]');

    spans.forEach(span => {
        let textContent = span.textContent;

        TARGET_PERCENTS.forEach(conf => {
            if (textContent.includes(conf.targetText)) {

                // 1. Sửa chữ %
                span.childNodes.forEach(node => {
                    if (node.nodeType === 3) {
                        let val = node.nodeValue.trim();
                        if (val.includes(conf.targetText)) {
                            node.nodeValue = " " + conf.newText;
                        }
                    }
                });

                // 2. Đổi màu chữ
                span.style.color = conf.newColor;

                // 3. Xử lý mũi tên — dựa vào direction
                const svg = span.querySelector('svg');
                if (svg) {
                    const goDown = conf.direction === "xuong";
                    svg.style.transform  = goDown ? "rotate(0deg)" : "rotate(180deg)";
                    svg.style.fill       = conf.newColor;
                    svg.style.color      = conf.newColor;
                    svg.style.removeProperty('--x-color');
                    const path = svg.querySelector('path');
                    if (path) path.setAttribute('fill', conf.newColor);
                }
            }
        });
    });
}
    // ==================================================================
    // HÀM 3: VẼ BIỂU ĐỒ (Mình đã bật lại để biểu đồ khớp với số liệu tăng)
    // ==================================================================
  function rebuildCharts() {
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
            const rect = svg.getBoundingClientRect();
            if (rect.width < 150) return;
            if (svg.querySelector('image')) return;
            if (svg.querySelector('mask')) return;
            // Dọn dẹp
            svg.removeAttribute('clip-path');
            svg.querySelectorAll('clipPath').forEach(c => c.remove());

            // Ẩn đường cũ
            const oldPaths = svg.querySelectorAll('path:not([id^="my-custom"])');
            oldPaths.forEach(p => {
                const d = p.getAttribute('d') || "";
                if (d.length > 50) p.style.display = 'none';
            });
            svg.querySelectorAll('circle:not([id^="my-custom"])').forEach(c => c.style.display = 'none');

            // --- VẼ LỚP FILL (NỀN XANH DƯƠNG MỜ) ---
            let customFill = svg.querySelector('#my-custom-fill');
            if (!customFill) {
                customFill = document.createElementNS("http://www.w3.org/2000/svg", "path");
                customFill.setAttribute("id", "my-custom-fill");
                svg.insertBefore(customFill, svg.firstChild);
            }
            customFill.setAttribute("d", MY_FILL_D);
            customFill.style.setProperty("fill", COLORS.chartFill, "important"); // <--- Xanh dương mờ
            customFill.style.setProperty("stroke", "none", "important");


            // --- VẼ LỚP LINE (ĐƯỜNG KẺ XANH DƯƠNG) ---
            let customLine = svg.querySelector('#my-custom-line');
            if (!customLine) {
                customLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                customLine.setAttribute("id", "my-custom-line");
                svg.appendChild(customLine);
            }
            customLine.setAttribute("d", MY_LINE_D);
            customLine.style.setProperty("stroke", COLORS.chartLine, "important"); // <--- Xanh dương
            customLine.style.setProperty("stroke-width", "2px", "important");
            customLine.style.setProperty("fill", "none", "important");


            // --- VẼ CHẤM TRÒN ---
            

          

        });
    }
    // --- MAIN LOOP ---
    function main() {
        fixBigNumbers();  // Chạy sửa số to (comment, views)
        fixPercentages(); // Chạy sửa %
       rebuildCharts();
    }

    main();

    // Theo dõi sự thay đổi của trang (khi cuộn chuột hoặc click tab)
    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        for (let m = 0; m < mutations.length; m++) {
            if (mutations[m].addedNodes.length > 0) {
                shouldRun = true;
                break;
            }
        }
        if (shouldRun) main();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

})();
