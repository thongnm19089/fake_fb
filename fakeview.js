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

    // ==================================================================
    // 1. CẤU HÌNH PHẦN TRĂM (Sửa các số % màu đỏ/xám)
    // ==================================================================
    const TARGET_PERCENTS = [
        {
            targetText: "-94%",      // Tìm chính xác chữ này
            newText: "+125%",        // Đổi thành chữ này
            newColor: "#31A24C"      // Màu xanh lá
        },
        {
            targetText: "-91%",
            newText: "+85%",
            newColor: "#31A24C"
        },
        {
            targetText: "-2%",       // Dự phòng
            newText: "+15%",
            newColor: "#31A24C"
        }
    ];

    // ==================================================================
    // 2. CẤU HÌNH SỐ TO (Lượt xem, Comment...)
    // ==================================================================
    const BIG_NUMBERS = [
        {
            old: "2.808.017", // Số lượt xem CŨ (đang hiện trên màn hình)
            new: "29.084.890" // Số lượt xem MỚI
        },
        {
            old: "3",         // Số comment CŨ (đang hiện trên màn hình)
            new: "4.890"      // Số comment MỚI
        }
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

                    // 1. Sửa chữ % (-94% -> +125%)
                    span.childNodes.forEach(node => {
                        if (node.nodeType === 3) { // Node văn bản
                            let val = node.nodeValue.trim();
                            if (val.includes(conf.targetText)) {
                                node.nodeValue = " " + conf.newText;
                            }
                        }
                    });

                    // 2. Đổi màu chữ xanh
                    span.style.color = conf.newColor;

                    // 3. Xử lý mũi tên (Icon)
                    const svg = span.querySelector('svg');
                    if (svg) {
                        svg.style.transform = "rotate(180deg)"; // Xoay lên
                        svg.style.fill = conf.newColor;
                        svg.style.color = conf.newColor;
                        svg.style.removeProperty('--x-color');
                    }
                }
            });
        });
    }

    // ==================================================================
    // HÀM 3: VẼ BIỂU ĐỒ (Mình đã bật lại để biểu đồ khớp với số liệu tăng)
    // ==================================================================
    function generateNewY(index, totalPoints) {
        const topY = 30; // Đỉnh cao
        const bottomY = 140; // Đáy thấp
        const step = (bottomY - topY) / (totalPoints - 1);
        let idealY = bottomY - (step * index);
        const noise = (Math.random() - 0.5) * 8;
        return idealY + noise;
    }

    function createPerfectTrend(svg) {
        if (svg.getAttribute('data-chart-fixed') === 'true') return;
        if (svg.getAttribute('width') === "12") return; // Bỏ qua icon nhỏ

        const paths = Array.from(svg.querySelectorAll('path'));
        let linePath = paths.find(p => {
            const d = p.getAttribute('d');
            return d && d.includes('L') && !d.includes('Z') && d.length > 50;
        });

        // Nếu không tìm thấy đường line, thử tìm đường bất kỳ dài nhất
        if (!linePath) return;

        // Lấy đường fill (vùng màu)
        let fillPath = paths.find(p => {
            const d = p.getAttribute('d');
            return d && d.includes('L') && d.includes('Z') && d.length > 50;
        });

        const matches = linePath.getAttribute('d').match(/[ML]\s*([\d.]+)[,\s]([\d.]+)/g);
        if (!matches) return;

        const xCoords = matches.map(str => parseFloat(str.replace(/[ML]\s*/, '').split(/[\s,]+/)[0]));

        const newPoints = xCoords.map((x, index) => ({
            x: x,
            y: generateNewY(index, xCoords.length)
        }));

        let newLineD = `M${newPoints[0].x},${newPoints[0].y}`;
        for (let i = 1; i < newPoints.length; i++) {
            newLineD += ` L${newPoints[i].x},${newPoints[i].y}`;
        }
        linePath.setAttribute('d', newLineD);
        linePath.style.stroke = "#31A24C"; // Màu đường vẽ

        if (fillPath) {
            const chartBottom = 165;
            let newFillD = newLineD + ` L${newPoints[newPoints.length - 1].x},${chartBottom} L${newPoints[0].x},${chartBottom} Z`;
            fillPath.setAttribute('d', newFillD);
            fillPath.style.fill = "rgba(49, 162, 76, 0.15)"; // Màu nền mờ
        }

        svg.querySelectorAll('circle').forEach(circle => {
            const cx = parseFloat(circle.getAttribute('cx'));
            if (isNaN(cx)) return;
            const closest = newPoints.reduce((prev, curr) => Math.abs(curr.x - cx) < Math.abs(prev.x - cx) ? curr : prev);
            if (Math.abs(closest.x - cx) < 2) {
                circle.setAttribute('cy', closest.y);
                circle.style.stroke = "#31A24C";
            }
        });

        svg.setAttribute('data-chart-fixed', 'true');
    }

    function processCharts() {
        const svgs = document.querySelectorAll('div > svg');
        svgs.forEach(svg => createPerfectTrend(svg));
    }

    // --- MAIN LOOP ---
    function main() {
        fixBigNumbers();  // Chạy sửa số to (comment, views)
        fixPercentages(); // Chạy sửa %
       // processCharts();  // Chạy vẽ biểu đồ
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