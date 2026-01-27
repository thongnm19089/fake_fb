// ==UserScript==
// @name         Alone
// @namespace    http://tampermonkey.net/
// @version      23.1
// @description  Sửa % âm, Sửa số comment (3 -> 4.890), Vẽ biểu đồ
// @author       Bạn
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const COLORS = {
        chartLine: "#1877F2",
        chartFill: "rgba(24, 119, 242, 0.15)",
        textGrowth: "#31A24C"
    };

    const MY_LINE_D_LUV_STORY = "M97,94.798983L118.29918981481481,110.643335080685446L141.59837962962962,112.35746825032469L164.89756944444446,50L188.19675925925924,100.62371037386001L211.49594907407408,98.97202L234.79513888888889,115.875652135000635L258.0943287037037,104.826225981094105L281.3935185185185,104.772949L304.69270833333337,111.59507649596334L327.99189814814815,118.39961595916252L351.29108796296293,118.19520415772672L374.59027777777777,92.56627714986752L397.8894675925926,102.61364149270452L421.1886574074074,115.318815L444.48784722222223,107.10812670374264L467.787037037037,115.50913360672507L491.08622685185185,98.16677730091484L514.3854166666666,88.1311050034729L537.6846064814815,80.37989194168384L570.9837962962963,79.03308903110863L584.2829861111111,63.337760883734L607.5821759259259,64.984375L630.8813657407406,57.90024534786085L654.1805555555555,85.00072892235454L677.4797453703704,63.848766L700.7789351851851,60.13253750017842L724.078125,43.77679172474654";
    const MY_FILL_D_LUV_STORY = MY_LINE_D_LUV_STORY + " L724.078,183 L97,183 Z";

    // Cấu hình cho "luv story"
    const DATA_LUV_STORY = [
        { old: "2.144.912", new: "154.345.231" },
        { old: "2",        new: "1.890" },
        { old: "-2",        new: "+1.890" }
    ];

    const TARGET_PERCENTS_LUV_STORY = [
        { targetText: "-94%", newText: "+5%", newColor: "#31A24C" },
        { targetText: "-93%", newText: "+15%", newColor: "#31A24C" },
        { targetText: "-5%", newText: "+5%", newColor: "#31A24C" }
    ];

    // Cấu hình cho "Alone"
    const MY_LINE_D_ALONE = '';
    const MY_FILL_D_ALONE = MY_LINE_D_ALONE + " L724.078,183 L97,183 Z";

    const DATA_ALONE = [
        { old: "7.218.791", new: "252.084.890" },
        { old: "2",         new: "329.890" },
        { old: "-1.011",    new: "+1.890" }
    ];

    const TARGET_PERCENTS_ALONE = [
        { targetText: "-94%", newText: "-125%", newColor: "#31A24C" },
        { targetText: "-93%", newText: "+85%", newColor: "#31A24C" },
        { targetText: "-5%", newText: "+5%", newColor: "#31A24C" }
    ];

    // Biến toàn cục để lưu cấu hình hiện tại
    let data = DATA_LUV_STORY;
    let TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
    let my_line_d = MY_LINE_D_LUV_STORY;
    let my_fill_d = MY_FILL_D_LUV_STORY;

    // ==================================================================
    // KIỂM TRA TÊN TRANG
    // ==================================================================
    function checkPageName() {
        const elements = document.querySelectorAll('h1, span, div[role="heading"]');

        for (let el of elements) {
            const text = el.textContent;

            // Nếu tìm thấy "𝑨𝒍𝒐𝒏𝒆"
            if (text.includes("𝑨𝒍𝒐𝒏𝒆")) {
                data = DATA_ALONE;
                TARGET_PERCENTS = TARGET_PERCENTS_ALONE;
                my_line_d = MY_LINE_D_ALONE;
                my_fill_d = MY_FILL_D_ALONE;
                console.log("Detected page: 𝑨𝒍𝒐𝒏𝒆");
                return true;
            }

            // Nếu tìm thấy "luv story"
            if (text.toLowerCase().includes("𝑳𝒖𝒗 𝒔𝒕𝒐𝒓𝒚".toLowerCase()) ||
                text.toLowerCase().includes("luv story")) {
                data = DATA_LUV_STORY;
                TARGET_PERCENTS = TARGET_PERCENTS_LUV_STORY;
                my_line_d = MY_LINE_D_LUV_STORY;
                my_fill_d = MY_FILL_D_LUV_STORY;
                console.log("Detected page: 𝑳𝒖𝒗 𝒔𝒕𝒐𝒓𝒚");
                return true;
            }
        }
        return false;
    }

    // ==================================================================
    // HÀM 1: SỬA SỐ TO
    // ==================================================================
    function fixBigNumbers() {
        const spans = document.querySelectorAll('span[dir="auto"]');

        spans.forEach(span => {
            const text = span.textContent.trim();

            data.forEach(conf => {
                if (text === conf.old || text === conf.new) {
                    if (text !== conf.new) {
                        span.textContent = conf.new;
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

                    // 3. Xử lý mũi tên
                    const svg = span.querySelector('svg');
                    if (svg) {
                        svg.style.transform = "rotate(180deg)";
                        svg.style.fill = conf.newColor;
                        svg.style.color = conf.newColor;
                        svg.style.removeProperty('--x-color');
                    }
                }
            });
        });
    }

    // ==================================================================
    // HÀM 3: VẼ BIỂU ĐỒ
    // ==================================================================
    function rebuildCharts() {
        if (!window.location.href.includes("professional_dashboard")) return;
        if (my_line_d && my_fill_d) {
            const svgs = document.querySelectorAll('svg');
            svgs.forEach(svg => {
                const rect = svg.getBoundingClientRect();
                if (rect.width < 150) return;
                if (svg.querySelector('image')) return;
                if (svg.querySelector('mask')) return;

                svg.removeAttribute('clip-path');
                svg.querySelectorAll('clipPath').forEach(c => c.remove());

                const oldPaths = svg.querySelectorAll('path:not([id^="my-custom"])');
                oldPaths.forEach(p => {
                    const d = p.getAttribute('d') || "";
                    if (d.length > 50) p.style.display = 'none';
                });
                svg.querySelectorAll('circle:not([id^="my-custom"])').forEach(c => c.style.display = 'none');

                // Vẽ fill
                let customFill = svg.querySelector('#my-custom-fill');
                if (!customFill) {
                    customFill = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    customFill.setAttribute("id", "my-custom-fill");
                    svg.insertBefore(customFill, svg.firstChild);
                }
                customFill.setAttribute("d", my_fill_d);
                customFill.style.setProperty("fill", COLORS.chartFill, "important");
                customFill.style.setProperty("stroke", "none", "important");

                // Vẽ line
                let customLine = svg.querySelector('#my-custom-line');
                if (!customLine) {
                    customLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    customLine.setAttribute("id", "my-custom-line");
                    svg.appendChild(customLine);
                }
                customLine.setAttribute("d", my_line_d);
                customLine.style.setProperty("stroke", COLORS.chartLine, "important");
                customLine.style.setProperty("stroke-width", "2px", "important");
                customLine.style.setProperty("fill", "none", "important");

                // // Vẽ chấm tròn
                // const pointsToDraw = [
                //     {cx: 97, cy: 94.79},
                //     {cx: 164.8, cy: 50},
                //     {cx: 724, cy: 43.77}
                // ];

                pointsToDraw.forEach((pt, idx) => {
                    let dotId = `my-custom-dot-${idx}`;
                    let dot = svg.querySelector(`#${dotId}`);
                    if (!dot) {
                        dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        dot.setAttribute("id", dotId);
                        dot.setAttribute("r", "4");
                        svg.appendChild(dot);
                    }
                    dot.setAttribute("cx", pt.cx);
                    dot.setAttribute("cy", pt.cy);
                    dot.style.setProperty("fill", "#FFFFFF", "important");
                    dot.style.setProperty("stroke", COLORS.chartLine, "important");
                    dot.style.setProperty("stroke-width", "2px", "important");
                });
            });
        }
    }

    // ==================================================================
    // MAIN LOOP
    // ==================================================================
    function main() {
        checkPageName();  // Kiểm tra tên trang trước
        fixBigNumbers();
        fixPercentages();
        rebuildCharts();
    }

    main();

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
