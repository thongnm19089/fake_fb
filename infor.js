// ==UserScript==
// @name         Facebook Detail Magic V8 (Body Only Fix)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Thay thế số liệu bảng (Chỉ can thiệp tbody, bỏ qua header)
// @author       Alone / Luv Story
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH 1: SỐ LIỆU TỔNG QUAN (Header to - Card) ---
    const HEADER_STATS = [
        { find: "2,1 triệu", replace: "13,2 triệu" },
        { find: "2,1\u00A0triệu", replace: "13,3 triệu" },
        { find: "856.810", replace: "9.856.810" },
        { find: "1.606", replace: "60" },
        { find: "-111", replace: "270" },
        { find: "2", replace: "13" },
        { find: "1", replace: "8" },
        { find: "270", replace: "360" },
        { find: "1,5K", replace: "400" },
    ];
    const HEADER_STATS_ALONE = [
        { find: "2,1 triệu", replace: "13,2 triệu" },
        { find: "7,2\u00A0triệu", replace: "27 triệu" },
        { find: "1.197.225", replace: "15.136.320" },
        { find: "1.677", replace: "160" },
        { find: "-1.013", replace: "870" },
        { find: "2", replace: "13" },
        { find: "1", replace: "8" },
        { find: "270", replace: "360" },
        { find: "1,5K", replace: "400" },
    ];
    // --- CẤU HÌNH 2: DỮ LIỆU BẢNG (KHÓA CỨNG THEO HÀNG TRONG BODY) ---
    // Index 0 = Bài viết đầu tiên (Không tính dòng tiêu đề)
   const TABLE_DATA = [
        // Hàng 1 (Bài mới nhất) - 18.675 > 10k nên đổi, 9.000 giữ nguyên
        { col3: "18k", col4: "9.000", col5: "9.300", col6: "25", col7: "150", col8: "75", col13: "3" },

        // Hàng 2 - Các số lớn đều đổi sang k, số 8.050 nhỏ hơn 10k giữ nguyên
        { col3: "300k", col4: "93k", col5: "97k", col6: "150", col7: "6.100", col8: "1.050", col13: "37" },

        // Hàng 3
        { col3: "38k", col4: "20k", col5: "20k", col6: "725", col7: "5.600", col8: "100", col13: "4" },

        // Hàng 4
        { col3: "69k", col4: "39k", col5: "38k", col6: "250", col7: "2.925", col8: "300", col13: "11" },

        // Hàng 5
        { col3: "35k", col4: "21k", col5: "21k", col6: "100", col7: "2.950", col8: "0", col13: "6" },

        // Hàng 6
        { col3: "42k", col4: "23k", col5: "22k", col6: "175", col7: "5.325", col8: "125", col13: "5" },

        // Hàng 7
        { col3: "60k", col4: "32k", col5: "33k", col6: "100", col7: "3.175", col8: "0", col13: "5" },

        // Hàng 8
        { col3: "141k", col4: "72k", col5: "76k", col6: "375", col7: "25", col8: "250", col13: "16" },

        // Hàng 9
        { col3: "96k", col4: "51k", col5: "51k", col6: "125", col7: "50", col8: "0", col13: "16" }
    ];

    const PERCENTS = [
        { find: "93,7%", replace: "5%" },
        { find: "68,1%", replace: "125,4%" },
        { find: "587,8%", replace: "-40,4%" },
        { find: "74,3%", replace: "25,1%" },
        { find: "10,4%", replace: "15,2%" },
        { find: "96", replace: "-18%" },
        { find: "92,6", replace: "9%" },
        { find: "92,6", replace: "9%" },
        { find: "83", replace: "34%" },
        { find: "102", replace: "34%" },
        { find: "84", replace: "-5%" },
     ];

    const GREEN_COLOR = "#006b4e";
    const RED_COLOR = "#a20c17";

    function processHeaderAndPercents() {
        // Chỉ tìm trong các thẻ chứa số liệu tổng quan (thường không nằm trong bảng)
        // Hoặc lọc kỹ hơn để tránh ảnh hưởng tiêu đề bảng nếu cần
        const elements = document.querySelectorAll('span, div');
        elements.forEach(el => {
            if (!el.firstChild || el.firstChild.nodeType !== 3) return;
            let text = el.textContent.trim();

            HEADER_STATS.forEach(item => {
                if (text === item.find || text.replace(/\u00A0/g, ' ') === item.find) {
                    el.textContent = item.replace;
                }
            });

            PERCENTS.forEach(item => {
                if (text.includes(item.find)) {
                    const isNegative = item.replace.trim().startsWith('-');
                    const finalColor = isNegative ? RED_COLOR : GREEN_COLOR;

                    if (el.textContent !== item.replace) el.textContent = item.replace;
                    el.style.color = finalColor;
                    el.style.setProperty("color", finalColor, "important");

                    let parent = el.parentElement;
                    if (parent) {
                        let svg = parent.querySelector('svg');
                        if (svg) {
                            svg.style.color = finalColor;
                            svg.style.fill = finalColor;
                            svg.style.transform = isNegative ? "rotate(0deg)" : "rotate(180deg)";
                            let path = svg.querySelector('path');
                            if (path) path.setAttribute('fill', finalColor);
                        }
                    }
                }
            });
        });
    }

    // --- HÀM QUAN TRỌNG: CHỈ XỬ LÝ TRONG TBODY ---
    function processTableByPosition() {
        // Thay đổi Selector: Chỉ tìm tr nằm trong tbody
        // Điều này đảm bảo dòng tiêu đề (nằm trong thead) sẽ bị bỏ qua
        const rows = document.querySelectorAll('tbody tr[role="row"]');

        rows.forEach((row, rowIndex) => {
            // rowIndex bây giờ bắt đầu từ 0 cho bài viết đầu tiên
            if (!TABLE_DATA[rowIndex]) return;

            const rowData = TABLE_DATA[rowIndex];

            for (const [key, value] of Object.entries(rowData)) {
                // key ví dụ: col3 => lấy số 3
                const colIndex = key.replace('col', '');

                // Tìm ô dữ liệu tương ứng trong hàng
                const cell = row.querySelector(`[aria-colindex="${colIndex}"]`);

                if (cell) {
                    const spans = cell.querySelectorAll('span');
                    for (let s of spans) {
                         // Chỉ thay thế nếu node đó không có con (là node lá chứa text)
                         if (s.children.length === 0 && s.textContent.trim() !== "") {
                             // Bỏ qua dòng chữ nhỏ "từ quảng cáo"
                             if (s.textContent.includes("quảng cáo")) continue;

                             // Hard replace: Thấy là đổi, không quan tâm số cũ
                             if (s.textContent !== value) {
                                 s.textContent = value;
                             }
                             break; // Xong ô này thì thoát loop span
                         }
                    }
                }
            }
        });
    }

    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        for (let m = 0; m < mutations.length; m++) {
            if (mutations[m].addedNodes.length > 0 || mutations[m].type === 'characterData') {
                shouldRun = true;
                break;
            }
        }
        if (shouldRun) {
            processHeaderAndPercents();
            processTableByPosition();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Run immediately
    processHeaderAndPercents();
    processTableByPosition();
})();
