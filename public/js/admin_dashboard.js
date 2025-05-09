document.addEventListener('DOMContentLoaded', () => {
    // User Growth Line Chart
    const ugCtx = document
        .getElementById('userGrowthChart')
        .getContext('2d');
    new Chart(ugCtx, {
        type: 'line',
        data: {
            labels: window.chartsData.userGrowth.labels,
            datasets: [{
                label: 'New Users',
                data: window.chartsData.userGrowth.data,
                fill: false,
                borderWidth: 2,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Weekly Sales Bar Chart
    const stCtx = document
        .getElementById('salesTrendChart')
        .getContext('2d');
    new Chart(stCtx, {
        type: 'bar',
        data: {
            labels: window.chartsData.salesTrend.labels,
            datasets: [{
                label: 'Sales (₹)',
                data: window.chartsData.salesTrend.data,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});
