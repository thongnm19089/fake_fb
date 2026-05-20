// ==UserScript==
// @name         Facebook Detail Magic V8 (Skip First Row)
// @namespace    http://tampermonkey.net/
// @version      8.4
// @description  Tự động nhân hệ số từ hàng thứ 2 trở đi, dòng đầu giữ nguyên
// @author       Alone / Luv Story
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH SỐ LIỆU TỔNG QUAN ---
    const HEADER_STATS_LUV_STORY = [
        { find: "2,1 triệu", replace: "13,2 triệu" },
        { find: "10,9\u00A0triệu", replace: "34,13 triệu" },
        { find: "2.099.542", replace: "12.099.542" },
        { find: "120,9K", replace: "420,9K" },
    ];

    const PERCENTS_LUV_STORY = [
        { find: "93,7%", replace: "5%" },
    ];

    let HEADER_STATS = HEADER_STATS_LUV_STORY;
    let PERCENTS = PERCENTS_LUV_STORY;

    function autoCalculate(currentText, multiplier) {
        let cleanText = currentText.replace(/\./g, '').replace(/,/g, '.');
        let number = parseFloat(cleanText);
        if (isNaN(number)) return currentText;

        let result = Math.round(number * multiplier);
        return result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function processHeaderAndPercents() {
        const container = document.body;
        if (!container) return;
        const elements = container.querySelectorAll('span, div, text');
        elements.forEach(el => {
            if (!el.firstChild || el.firstChild.nodeType !== 3) return;
            let text = el.textContent.trim();

            HEADER_STATS.forEach(item => {
                if (text === item.find || text.replace(/\u00A0/g, ' ') === item.find) {
                    el.textContent = item.replace;
                }
            });
        });
    }

    function processTableByPosition() {
        // Lấy tất cả các hàng trong tbody
        const rows = document.querySelectorAll('tbody tr[role="row"]');

        rows.forEach((row, index) => {
            // KIỂM TRA: Nếu là hàng đầu tiên (index = 0) thì bỏ qua, không làm gì cả
            if (index === 0) {
                return;
            }

            // Từ hàng thứ 2 trở đi (index > 0), thực hiện nhân hệ số
            const config = [
                { index: "4", mult: 3 },
                { index: "5", mult: 3 },
                { index: "6", mult: 4 },
                { index: "8", mult: 3 }
            ];

            config.forEach(item => {
                const cell = row.querySelector(`[aria-colindex="${item.index}"]`);
                if (cell) {
                    const spans = cell.querySelectorAll('span');
                    for (let s of spans) {
                        if (s.children.length === 0 && s.textContent.trim() !== "") {
                            let originalText = s.textContent.trim();

                            if (!s.dataset.processed) {
                                if (/[\d]/.test(originalText)) {
                                    let newValue = autoCalculate(originalText, item.mult);
                                    s.textContent = newValue;
                                    s.dataset.processed = "true";
                                }
                            }
                            break;
                        }
                    }
                }
            });
        });
    }

    function main() {
        processHeaderAndPercents();
        processTableByPosition();
    }

    const observer = new MutationObserver((mutations) => {
        let shouldRun = false;
        for (let m = 0; m < mutations.length; m++) {
            if (mutations[m].addedNodes.length > 0 || mutations[m].type === 'characterData') {
                shouldRun = true;
                break;
            }
        }
        if (shouldRun) main();
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true
    });

    main();
})();
