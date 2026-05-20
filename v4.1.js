// ==UserScript==
// @name         Facebook Dashboard Magic V24 (Multi-Page Support)
// @namespace    http://tampermonkey.net/
// @version      24.0
// @description  Tự động đổi số liệu và biểu đồ dựa trên tên Page (Alone / Luv story)
// @author       Bạn
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================================================================
    // 1. DỮ LIỆU MẶC ĐỊNH (Sẽ bị ghi đè nếu nhận diện được Page)
    // ==================================================================
    let CURRENT_TARGET_PERCENTS = [];
    let CURRENT_BIG_NUMBERS = [];
    let CURRENT_LINE_D = "";
    let CURRENT_FILL_D = "";

    const COLORS = {
        chartLine: "#1877F2",
        chartFill: "rgba(24, 119, 242, 0.15)",
        textGrowth: "#31A24C"
    };3
    // --- Cấu hình cho Page: 𝑨𝒍𝒐𝒏𝒆 ---
    const TARGET_PERCENTS_ALONE = [
        { targetText: "-3%", newText: "13%", newColor: "#3fbb46", direction: "len" },
        { targetText: "-6%", newText: "1%", newColor: "#3fbb46", direction: "len" },
        { targetText: "74%", newText: "-7%", newColor: "#ff7c74", direction: "len" }
    ];
    const BIG_NUMBERS_ALONE = [
        { old: "22.364.803", new: "66.364.803" },
        { old: "530.285", new: "930.285" },
        { old: "466.248", new: "666.248" }
    ];
    // Đã thêm nhiễu (noise) vào nửa sau để tạo độ nhấp nhô tự nhiên, không còn thẳng tuột
// Biểu đồ nhấp nhô giật khúc mạnh (biên độ lớn), phong cách dữ liệu "bot"
// Biểu đồ tịnh tiến: 20 điểm đầu hạ thấp xuống (y tăng) + 8 điểm cuối giữ phong độ
// Cập nhật cho ALONE: Nâng đáy, giật khúc mạnh và vọt đỉnh ở cuối
const MY_LINE_D_ALONE = "M104,142.14L126.96,135.00L149.92,110.94L172.89,126.45L195.85,113.43L218.82,105.43L241.78,70.37L264.74,118.29L287.71,113.03L310.67,126.34L333.64,136.39L356.60,145.71L379.56,135.00L402.53,148.13L425.49,115.97L448.46,134.47L471.42,115.33L494.39,62.00L517.35,95.50L540.31,100.20L563.28,108.40L586.24,125.80L609.21,130.30L632.17,115.10L655.13,118.90L678.10,80.00L701.06,90.50L724.03,95.20";

// Lớp nền (Fill) khớp với 28 điểm mới, chân giữ ở y=171
const MY_FILL_D_ALONE = MY_LINE_D_ALONE + " L724.03,171 L104,171 Z";


    // --- Cấu hình cho Page: 𝑳𝒖𝒗 𝒔𝒕𝒐𝒓𝒚 ---
    const TARGET_PERCENTS_LUV_STORY = [
        { targetText: "105%", newText: "5%", newColor: "#3fbb46", direction: "len" },
        { targetText: "-20%", newText: "120%", newColor: "#3fbb46", direction: "len" }
    ];
    const BIG_NUMBERS_LOVER = [
        { old: "26.393.643", new: "67.938.837" },
          { old: "504.088", new: "846.052" } // Ví dụ số liệu cho Luv story
    ];
    const TARGET_PERCENTS_LOVER = [
        { targetText: "-25%", newText: "16%", newColor: "#3fbb46", direction: "len" },
        { targetText: "-30%", newText: "2%", newColor: "#3fbb46", direction: "len" },
        { targetText: "a%", newText: "-7%", newColor: "#ff7c74", direction: "len" }
    ];
    const MY_LINE_D_LOVER = "M90,116.73L113.48,110.64L136.96,138.54L160.44,142.29L183.93,135.75L207.41,94.39L230.89,132.54L254.37,92.09L277.86,131.67L301.34,145.00L324.82,136.96L348.30,120.12L371.79,85.68L395.27,125.62L418.75,95.92L442.23,125.63L465.72,138.20L489.20,126.15L512.68,135.65L536.17,124.14L559.65,103.55L583.13,115.96L606.61,24.00L630.10,115.51L653.58,102.83L677.06,131.65L700.54,125.49L724.03,115.79";
    const MY_FILL_D_LOVER = MY_LINE_D_LOVER + " L724.03,171 L90,171 Z";

    const BIG_NUMBERS_MER = [
       { old: "34.816.187", new: "105.092.968" },
         { old: "719.150", new: "1.225.375" }
    ];
    const MY_LINE_D_MER = "M97,144.57L120.22,64.95L143.45,144.67L166.67,156.58L189.89,53.62L213.12,33.01L236.34,141.07L259.56,156.00L282.79,120.03L306.01,52.81L329.23,149.22L352.46,163.13L375.68,87.50L398.90,124.71L422.13,24.00L445.35,80.13L468.57,45.54L491.80,119.30L515.02,124.37L538.24,144.12L561.47,151.61L584.69,136.03L607.91,143.90L631.14,150.85L654.36,95.20L677.58,115.00L700.81,88.25L724.03,112.39";
    const MY_FILL_D_MER = MY_LINE_D_MER + " L724.03,171 L97,171 Z";
//-------------------------------------------------------------------------------------------------
     const BIG_NUMBERS_MIS = [
        { old: "29.016.163", new: "89.802.670" },
         { old: "484.331", new: "899.360" } // Ví dụ số liệu cho Luv story
    ];
    const TARGET_PERCENTS_MIS = [
        { targetText: "-49%", newText: "7%", newColor: "#3fbb46", direction: "len" }, //3fbb46
        { targetText: "-54%", newText: "12%", newColor: "#3fbb46", direction: "len" },
        { targetText: "a%", newText: "-7%", newColor: "#ff7c74", direction: "len" }
    ];
    const MY_LINE_D_MIS = "M97,127.65L120.22,46.95L143.45,110.60L166.67,145.20L189.89,89.67L213.12,97.90L236.34,142.25L259.56,118.70L282.79,103.27L306.01,74.46L329.23,148.77L352.46,145.62L375.68,89.38L398.90,95.57L422.13,24.00L445.35,114.62L468.57,102.53L491.80,143.03L515.02,112.56L538.24,137.40L561.47,135.51L584.69,77.90L607.91,125.60L631.14,145.38L654.36,115.62L677.58,128.93L700.81,155.27L724.03,122.50";
    const MY_FILL_D_MIS = MY_LINE_D_MIS + " L724.03,171 L97,171 Z";
    // Sử dụng lại line cũ hoặc bạn có thể thay MY_LINE_D_LUV_STORY riêng ở đây
    const MY_LINE_D_LUV_STORY = MY_LINE_D_ALONE;
    const MY_FILL_D_LUV_STORY = MY_FILL_D_ALONE;

    // ==================================================================
    // HÀM NHẬN DIỆN PAGE
    // ==================================================================
    function checkPageName() {
        const elements = document.querySelectorAll('h1, span, div[role="heading"]');
        for (let el of elements) {
            const text = el.textContent;

            if (text.includes("𝑨𝒍𝒐𝒏𝒆")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_ALONE;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_ALONE;
                CURRENT_LINE_D = MY_LINE_D_ALONE;
                CURRENT_FILL_D = MY_FILL_D_ALONE;
                return true;
            }

            if (text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.".toLowerCase()) || text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_LOVER;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_LOVER;
                CURRENT_LINE_D = MY_LINE_D_LOVER;
                CURRENT_FILL_D = MY_FILL_D_LOVER;
                return true;
            }
            if (text.toLowerCase().includes("Mer.".toLowerCase()) || text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_MER;
                CURRENT_LINE_D = MY_LINE_D_MER;
                CURRENT_FILL_D = MY_FILL_D_MER;
                return true;
            }
            if (text.toLowerCase().includes("miss la nho?".toLowerCase()) || text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_MIS;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_MIS;
                CURRENT_LINE_D = MY_LINE_D_MIS;
                CURRENT_FILL_D = MY_FILL_D_MIS;
                return true;
            }
        }
        // Mặc định nếu không tìm thấy thì lấy Alone
        CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_ALONE;
        CURRENT_BIG_NUMBERS = BIG_NUMBERS_ALONE;
        CURRENT_LINE_D = MY_LINE_D_ALONE;
        CURRENT_FILL_D = MY_FILL_D_ALONE;
        return false;
    }

    // ==================================================================
    // CÁC HÀM XỬ LÝ GIAO DIỆN (Sử dụng các biến CURRENT_...)
    // ==================================================================
    function fixBigNumbers() {
        const spans = document.querySelectorAll('span[dir="auto"]');
        spans.forEach(span => {
            const text = span.textContent.trim();
            CURRENT_BIG_NUMBERS.forEach(conf => {
                if (text === conf.old || text === conf.new) {
                    if (text !== conf.new) span.textContent = conf.new;
                }
            });
        });
    }

    function fixPercentages() {
        const spans = document.querySelectorAll('span[dir="auto"]');
        spans.forEach(span => {
            let textContent = span.textContent;
            CURRENT_TARGET_PERCENTS.forEach(conf => {
                if (textContent.includes(conf.targetText)) {
                    span.childNodes.forEach(node => {
                        if (node.nodeType === 3 && node.nodeValue.trim().includes(conf.targetText)) {
                            node.nodeValue = " " + conf.newText;
                        }
                    });
                    span.style.color = conf.newColor;
                    const svg = span.querySelector('svg');
                    if (svg) {
                        svg.style.transform = conf.direction === "xuong" ? "rotate(0deg)" : "rotate(180deg)";
                        svg.style.fill = conf.newColor;
                        const path = svg.querySelector('path');
                        if (path) path.setAttribute('fill', conf.newColor);
                    }
                }
            });
        });
    }

    function rebuildCharts() {
        if (!CURRENT_LINE_D) return;
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
            const rect = svg.getBoundingClientRect();
            if (rect.width < 150 || svg.querySelector('image') || svg.querySelector('mask')) return;

            svg.removeAttribute('clip-path');
            svg.querySelectorAll('clipPath').forEach(c => c.remove());

            const oldPaths = svg.querySelectorAll('path:not([id^="my-custom"])');
            oldPaths.forEach(p => {
                if ((p.getAttribute('d') || "").length > 50) p.style.display = 'none';
            });
            svg.querySelectorAll('circle:not([id^="my-custom"])').forEach(c => c.style.display = 'none');

            let customFill = svg.querySelector('#my-custom-fill') || document.createElementNS("http://www.w3.org/2000/svg", "path");
            if (!customFill.id) {
                customFill.id = "my-custom-fill";
                svg.insertBefore(customFill, svg.firstChild);
            }
            customFill.setAttribute("d", CURRENT_FILL_D);
            customFill.style.setProperty("fill", COLORS.chartFill, "important");
            customFill.style.setProperty("stroke", "none", "important");

            let customLine = svg.querySelector('#my-custom-line') || document.createElementNS("http://www.w3.org/2000/svg", "path");
            if (!customLine.id) {
                customLine.id = "my-custom-line";
                svg.appendChild(customLine);
            }
            customLine.setAttribute("d", CURRENT_LINE_D);
            customLine.style.setProperty("stroke", COLORS.chartLine, "important");
            customLine.style.setProperty("stroke-width", "2px", "important");
            customLine.style.setProperty("fill", "none", "important");
        });
    }

    function main() {
        if (!window.location.href.includes("/professional_dashboard")) return;
        checkPageName(); // Cập nhật dữ liệu theo Page
        fixBigNumbers();
        fixPercentages();
        rebuildCharts();
    }

    // --- Khởi chạy ---
    main();
    const observer = new MutationObserver(() => main());
    observer.observe(document.documentElement, { childList: true, subtree: true });

})();
