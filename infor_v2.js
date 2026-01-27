// ==UserScript==
// @name         Facebook Detail Magic V8 (Body Only Fix)
// @namespace    http://tampermonkey.net/
// @version      8.1
// @description  Thay thế số liệu bảng (Chỉ can thiệp tbody, bỏ qua header)
// @author       Alone / Luv Story
// @match        *://*.facebook.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // --- CẤU HÌNH 1: SỐ LIỆU TỔNG QUAN (Header to - Card) ---
    const HEADER_STATS_LUV_STORY = [
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

    // --- CẤU HÌNH 2: DỮ LIỆU BẢNG (KHÓA CỨNG THEO HÀNG TRONG BODY) ---
    const TABLE_DATA_LUV_STORY = [
        { col3: "19k", col4: "9.000", col5: "9.300", col6: "225", col7: "150", col8: "75", col13: "3" },
        { col3: "300k", col4: "93k", col5: "97k", col6: "8.050", col7: "6.100", col8: "1.050", col13: "37" },
        { col3: "38k", col4: "20k", col5: "20k", col6: "5.725", col7: "5.600", col8: "100", col13: "4" },
        { col3: "69k", col4: "39k", col5: "38k", col6: "3.250", col7: "2.925", col8: "300", col13: "11" },
        { col3: "35k", col4: "21k", col5: "21k", col6: "3.100", col7: "2.950", col8: "0", col13: "6" },
        { col3: "42k", col4: "23k", col5: "22k", col6: "5.475", col7: "5.325", col8: "125", col13: "5" },
        { col3: "60k", col4: "32k", col5: "33k", col6: "3.200", col7: "3.175", col8: "0", col13: "5" },
        { col3: "141k", col4: "72k", col5: "76k", col6: "4.375", col7: "3.725", col8: "250", col13: "16" },
        { col3: "96k", col4: "51k", col5: "51k", col6: "6.525", col7: "5.850", col8: "0", col13: "16" }
    ];

    const PERCENTS_LUV_STORY = [
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

    //page alone
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

    const TABLE_DATA_ALONE = [
        { col3: "19k", col4: "9.000", col5: "9.300", col6: "225", col7: "150", col8: "75", col13: "3" },
        { col3: "300k", col4: "93k", col5: "97k", col6: "8.050", col7: "6.100", col8: "1.050", col13: "37" },
        { col3: "38k", col4: "20k", col5: "20k", col6: "5.725", col7: "5.600", col8: "100", col13: "4" },
        { col3: "69k", col4: "39k", col5: "38k", col6: "3.250", col7: "2.925", col8: "300", col13: "11" },
        { col3: "35k", col4: "21k", col5: "21k", col6: "3.100", col7: "2.950", col8: "0", col13: "6" },
        { col3: "42k", col4: "23k", col5: "22k", col6: "5.475", col7: "5.325", col8: "125", col13: "5" },
        { col3: "60k", col4: "32k", col5: "33k", col6: "3.200", col7: "3.175", col8: "0", col13: "5" },
        { col3: "141k", col4: "72k", col5: "76k", col6: "4.375", col7: "3.725", col8: "250", col13: "16" },
        { col3: "96k", col4: "51k", col5: "51k", col6: "6.525", col7: "5.850", col8: "0", col13: "16" }
    ];

    const PERCENTS_ALONE = [
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

    // Biến global để lưu config hiện tại
    let HEADER_STATS = [];
    let TABLE_DATA = [];
    let PERCENTS = [];

    function checkPageName() {
        // Nếu tìm thấy "𝑨𝒍𝒐𝒏𝒆"
        if (window.location.href.includes("asset_id=100422172808095")) {
            HEADER_STATS = HEADER_STATS_ALONE;
            TABLE_DATA = TABLE_DATA_ALONE;
            PERCENTS = PERCENTS_ALONE;
            console.log("✅ Detected: ALONE page");
            return true;
        }

        // Nếu tìm thấy "luv story"
        if (window.location.href.includes("asset_id=443574862165067")) {
            HEADER_STATS = HEADER_STATS_LUV_STORY;
            TABLE_DATA = TABLE_DATA_LUV_STORY;
            PERCENTS = PERCENTS_LUV_STORY;
            console.log("✅ Detected: LUV STORY page");
            return true;
        }

        console.log("⚠️ No matching page detected");
        return false;
    }

    const GREEN_COLOR = "#006b4e";
    const RED_COLOR = "#a20c17";

    function processHeaderAndPercents() {
        if (!window.location.href.includes("overview")) return;

        const container = document.querySelector('div[data-pagelet="BizWebInsightsOverviewMonthlySummaryCard"]');
        if (!container) return;

        const elements = container.querySelectorAll('span, div');
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

    function processTableByPosition() {
        const rows = document.querySelectorAll('tbody tr[role="row"]');

        rows.forEach((row, rowIndex) => {
            if (!TABLE_DATA[rowIndex]) return;

            const rowData = TABLE_DATA[rowIndex];

            for (const [key, value] of Object.entries(rowData)) {
                const colIndex = key.replace('col', '');
                const cell = row.querySelector(`[aria-colindex="${colIndex}"]`);

                if (cell) {
                    const spans = cell.querySelectorAll('span');
                    for (let s of spans) {
                        if (s.children.length === 0 && s.textContent.trim() !== "") {
                            if (s.textContent.includes("quảng cáo")) continue;

                            if (s.textContent !== value) {
                                s.textContent = value;
                            }
                            break;
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
            checkPageName();
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
    checkPageName();
    processHeaderAndPercents();
    processTableByPosition();
})();
