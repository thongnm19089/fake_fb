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
    };

    // --- Cấu hình cho Page: 𝑨𝒍𝒐𝒏𝒆 ---
    const TARGET_PERCENTS_ALONE = [
        { targetText: "47%", newText: "17%", newColor: "#3fbb46", direction: "xuong" },
        { targetText: "90%", newText: "20%", newColor: "#3fbb46", direction: "xuong" },
        { targetText: "74%", newText: "-7%", newColor: "#ff7c74", direction: "len" }
    ];
    const BIG_NUMBERS_ALONE = [
        { old: "15.099.342", new: "55.099.342" },
        { old: "2.743", new: "8.229" },
        { old: "285.324", new: "585.324" }
    ];
    // Đã thêm nhiễu (noise) vào nửa sau để tạo độ nhấp nhô tự nhiên, không còn thẳng tuột
// Biểu đồ nhấp nhô giật khúc mạnh (biên độ lớn), phong cách dữ liệu "bot"
const MY_LINE_D_ALONE = "M90,91.94L113.48,68.14L136.96,151.83L160.44,78.64L183.93,153.20L207.41,151.51L230.89,148.51L254.37,135.87L277.86,20L301.34,138.56L324.82,133.10L348.30,124.44L371.79,106.82L395.27,114.80L418.75,139.67L442.23,101.49L465.72,120.00L489.20,99.67L512.68,129.10L536.17,90.34L559.65,105.83L583.13,113.04L606.61,113.16L630.10,95.70L653.58,122.34L677.06,108.75L700.54,104.30L724.03,88.81";

// Lớp nền (Fill) khớp với các điểm giật khúc mới
const MY_FILL_D_ALONE = MY_LINE_D_ALONE + " L724.03,171 L90,171 Z";

    // --- Cấu hình cho Page: 𝑳𝒖𝒗 𝒔𝒕𝒐𝒓𝒚 ---
    const TARGET_PERCENTS_LUV_STORY = [
        { targetText: "105%", newText: "5%", newColor: "#3fbb46", direction: "len" },
        { targetText: "-20%", newText: "120%", newColor: "#3fbb46", direction: "len" }
    ];
    const BIG_NUMBERS_LOVER = [
        { old: "40.337.275", new: "70.337.275" } // Ví dụ số liệu cho Luv story
    ];
    const BIG_NUMBERS_MER = [
        { old: "20.720.211", new: "50.720.211" },
         { old: "386.301", new: "586.301" } // Ví dụ số liệu cho Luv story
    ];
     const BIG_NUMBERS_MIS = [
        { old: "29.765.615", new: "59.765.615" },
         { old: "533.333", new: "633.333" } // Ví dụ số liệu cho Luv story
    ];
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
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_LOVER;
                CURRENT_LINE_D = MY_LINE_D_LUV_STORY;
                CURRENT_FILL_D = MY_FILL_D_LUV_STORY;
                return true;
            }
            if (text.toLowerCase().includes("Mer.".toLowerCase()) || text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_MER;
                CURRENT_LINE_D = MY_LINE_D_LUV_STORY;
                CURRENT_FILL_D = MY_FILL_D_LUV_STORY;
                return true;
            }
            if (text.toLowerCase().includes("miss la nho?".toLowerCase()) || text.toLowerCase().includes("𝙇𝙤𝙫𝙚𝙧.")) {
                CURRENT_TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
                CURRENT_BIG_NUMBERS = BIG_NUMBERS_MIS;
                CURRENT_LINE_D = MY_LINE_D_LUV_STORY;
                CURRENT_FILL_D = MY_FILL_D_LUV_STORY;
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
