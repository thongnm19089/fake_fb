// ==UserScript==
// @name         Facebook Detail Magic V8 (Body Only Fix)
// @namespace    http://tampermonkey.net/
// @version      8.2
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
        { find: "10,9\u00A0triệu", replace: "34,13 triệu" },
       
        { find: "2.099.542", replace: "12.099.542" },
        { find: "120,9K", replace: "420,9K" },
       
    ];

const TABLE_DATA_LUV_STORY = [
  {
    "col4": "3.129",   // 1.289 * 3
    "col5": "1.772",   // 757 * 3
    "col6": "101",     // 157 * 4
    "col8": "2.101"    // 872 * 3
  },
 {
    "col4": "37.521",  // 12.507 * 3
    "col5": "20.259",  // 6.753 * 3
    "col6": "3.376",   // 844 * 4
    "col8": "24.168"   // 8.056 * 3
  },
  {
    "col4": "19.953",  // 6.651 * 3
    "col5": "11.130",  // 3.710 * 3
    "col6": "1.376",   // 344 * 4
    "col8": "13.437"   // 4.479 * 3
  },
  {
    "col4": "42.066",  // 14.022 * 3
    "col5": "22.284",  // 7.428 * 3
    "col6": "2.812",   // 703 * 4
    "col8": "26.376"   // 8.792 * 3
  },
  {
    "col4": "20.199",  // 6.733 * 3
    "col5": "10.866",  // 3.622 * 3
    "col6": "1.660",   // 415 * 4
    "col8": "13.116"   // 4.372 * 3
  },
  {
    "col4": "10.026",  // 3.342 * 3
    "col5": "5.313",   // 1.771 * 3
    "col6": "808",     // 202 * 4
    "col8": "6.399"    // 2.133 * 3
  },
  {
    "col4": "19.680",  // 6.560 * 3
    "col5": "10.125",  // 3.375 * 3
    "col6": "1.492",   // 373 * 4
    "col8": "12.873"   // 4.291 * 3
  },
  {
    "col4": "31.755",  // 10.585 * 3
    "col5": "16.155",  // 5.385 * 3
    "col6": "2.580",   // 645 * 4
    "col8": "20.448"   // 6.816 * 3
  },
    {
    "col4": "9.387",   // 3.129 * 3
    "col5": "5.316",   // 1.772 * 3
    "col6": "404",     // 101 * 4
    "col8": "6.303"    // 2.101 * 3
  },
  {
    "col4": "43.458",  // 14.486 * 3
    "col5": "22.047",  // 7.349 * 3
    "col6": "2.344",   // 586 * 4
    "col8": "25.746"   // 8.582 * 3
  },
  {
    "col4": "19.044",  // 6.348 * 3
    "col5": "11.211",  // 3.737 * 3
    "col6": "1.188",   // 297 * 4
    "col8": "13.218"   // 4.406 * 3
  },
  {
    "col4": "39.639",  // 13.213 * 3
    "col5": "23.205",  // 7.735 * 3
    "col6": "1.508",   // 377 * 4
    "col8": "27.156"   // 9.052 * 3
  },
  {
    "col4": "22.203",  // 7.401 * 3
    "col5": "13.023",  // 4.341 * 3
    "col6": "1.176",   // 294 * 4
    "col8": "15.135"   // 5.045 * 3
  },
  {
    "col4": "17.274",  // 5.758 * 3
    "col5": "9.165",   // 3.055 * 3
    "col6": "944",     // 236 * 4
    "col8": "10.953"   // 3.651 * 3
  },
  {
    "col4": "30.483",  // 10.161 * 3
    "col5": "17.559",  // 5.853 * 3
    "col6": "1.616",   // 404 * 4
    "col8": "19.887"   // 6.629 * 3
  },
    {
    "col4": "73.026",  // 24.342 * 3
    "col5": "39.792",  // 13.264 * 3
    "col6": "3.112",   // 778 * 4
    "col8": "44.574"   // 14.858 * 3
  },
  {
    "col4": "22.035",  // 7.345 * 3
    "col5": "12.078",  // 4.026 * 3
    "col6": "1.868",   // 467 * 4
    "col8": "14.049"   // 4.683 * 3
  },
  {
    "col4": "127.470", // 42.490 * 3
    "col5": "70.362",  // 23.454 * 3
    "col6": "5.764",   // 1.441 * 4
    "col8": "83.313"   // 27.771 * 3
  },
  {
    "col4": "30.426",  // 10.142 * 3
    "col5": "15.249",  // 5.083 * 3
    "col6": "2.568",   // 642 * 4
    "col8": "18.906"   // 6.302 * 3
  },
  {
    "col4": "124.335", // 41.445 * 3
    "col5": "64.200",  // 21.400 * 3
    "col6": "7.676",   // 1.919 * 4
    "col8": "79.242"   // 26.414 * 3
  },
  {
    "col4": "67.206",  // 22.402 * 3
    "col5": "35.976",  // 11.992 * 3
    "col6": "5.096",   // 1.274 * 4
    "col8": "43.242"   // 14.414 * 3
  },
  {
    "col4": "54.318",  // 18.106 * 3
    "col5": "28.530",  // 9.510 * 3
    "col6": "3.312",   // 828 * 4
    "col8": "33.243"   // 11.081 * 3
  },
  {
    "col4": "35.277",  // 11.759 * 3
    "col5": "18.315",  // 6.105 * 3
    "col6": "2.116",   // 529 * 4
    "col8": "22.359"   // 7.453 * 3
  },
    {
    "col4": "85.023",  // 28.341 * 3
    "col5": "41.613",  // 13.871 * 3
    "col6": "5.028",   // 1.257 * 4
    "col8": "50.886"   // 16.962 * 3
  },
  {
    "col4": "45.915",  // 15.305 * 3
    "col5": "25.836",  // 8.612 * 3
    "col6": "2.168",   // 542 * 4
    "col8": "29.595"   // 9.865 * 3
  },
  {
    "col4": "6.510",   // 2.170 * 3
    "col5": "3.786",   // 1.262 * 3
    "col6": "612",     // 153 * 4
    "col8": "4.479"    // 1.493 * 3
  },
  {
    "col4": "120.156", // 40.052 * 3
    "col5": "58.905",  // 19.635 * 3
    "col6": "7.828",   // 1.957 * 4
    "col8": "71.880"   // 23.960 * 3
  },
  {
    "col4": "16.671",  // 5.557 * 3
    "col5": "17.451",  // 5.817 * 3
    "col6": "3.112",   // 778 * 4
    "col8": "21.429"   // 7.143 * 3
  },
  {
    "col4": "88.569",  // 29.523 * 3
    "col5": "82.629",  // 27.543 * 3
    "col6": "10.064",  // 2.516 * 4
    "col8": "101.496"  // 33.832 * 3
  },
  {
    "col4": "25.479",  // 8.493 * 3
    "col5": "33.969",  // 11.323 * 3
    "col6": "4.516",   // 1.129 * 4
    "col8": "39.672"   // 13.224 * 3
  },
  {
    "col4": "15.042",  // 5.014 * 3
    "col5": "36.465",  // 12.155 * 3
    "col6": "5.148",   // 1.287 * 4
    "col8": "45.726"   // 15.242 * 3
  }
];

    const PERCENTS_LUV_STORY = [
        { find: "93,7%", replace: "5%" },
        
    ];

    // --- page ALONE ---
    const HEADER_STATS_ALONE = [
        { find: "2,1 triệu", replace: "13,2 triệu" },
        { find: "7,2\u00A0triệu", replace: "27 triệu" },
        
      
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
        
    ];

    // Biến global để lưu config hiện tại — mặc định LUV STORY
    let HEADER_STATS = HEADER_STATS_LUV_STORY;
    let TABLE_DATA   = TABLE_DATA_LUV_STORY;
    let PERCENTS     = PERCENTS_LUV_STORY;

    function checkPageName() {
        if (window.location.href.includes("asset_id=100422172808095")) {
            HEADER_STATS = HEADER_STATS_ALONE;
            TABLE_DATA   = TABLE_DATA_ALONE;
            PERCENTS     = PERCENTS_ALONE;
            console.log("✅ Detected: ALONE page");
        } else {
            // Khớp LUV STORY hoặc không match -> đều dùng LUV STORY
            HEADER_STATS = HEADER_STATS_LUV_STORY;
            TABLE_DATA   = TABLE_DATA_LUV_STORY;
            PERCENTS     = PERCENTS_LUV_STORY;
            if (window.location.href.includes("asset_id=443574862165067")) {
                console.log("✅ Detected: LUV STORY page");
            } else {
                console.log("⚠️ No matching page detected → Using LUV STORY as default");
            }
        }
    }

    const GREEN_COLOR = "#006b4e";
    const RED_COLOR   = "#a20c17";

    function processHeaderAndPercents() {
        // ✅ FIX: dùng document.body thay vì biến container chưa khai báo
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
                            svg.style.color     = finalColor;
                            svg.style.fill      = finalColor;
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
                            if (s.textContent !== value) s.textContent = value;
                            break;
                        }
                    }
                }
            }
        });
    }

    function main() {
        checkPageName();
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

    // Chạy ngay lập tức
    main();

})();
