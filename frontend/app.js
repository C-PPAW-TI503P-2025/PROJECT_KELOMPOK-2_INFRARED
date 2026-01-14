// Konfigurasi API
const API_BASE_URL = 'http://localhost:5000/api/trash';

// State management
let currentPage = 1;
let totalPages = 1;
let weeklyChart = null;

// DOM Elements
const elements = {
    todayCount: document.getElementById('todayCount'),
    totalCount: document.getElementById('totalCount'),
    todayEntries: document.getElementById('todayEntries'),
    totalEntries: document.getElementById('totalEntries'),
    historyTableBody: document.getElementById('historyTableBody'),
    sensorFilter: document.getElementById('sensorFilter'),
    refreshBtn: document.getElementById('refreshBtn'),
    prevPage: document.getElementById('prevPage'),
    nextPage: document.getElementById('nextPage'),
    pageInfo: document.getElementById('pageInfo'),
    lastUpdate: document.getElementById('lastUpdate'),
    apiStatus: document.getElementById('apiStatus')
};

// Fetch dashboard summary data
async function fetchDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch dashboard data');

        const result = await response.json();

        if (result.success) {
            const { today, total, weekly } = result.data;

            // Update statistics cards
            elements.todayCount.textContent = today.count;
            elements.todayEntries.textContent = today.entries;
            elements.totalCount.textContent = total.count;
            elements.totalEntries.textContent = total.entries;

            // Update chart
            updateWeeklyChart(weekly);

            // Update API status
            updateAPIStatus(true);
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        updateAPIStatus(false);
    }
}

// Fetch history entries with pagination
async function fetchHistoryData(page = 1) {
    try {
        const sensorId = elements.sensorFilter.value;
        let url = `${API_BASE_URL}/entries?page=${page}&limit=10`;

        if (sensorId) {
            url += `&sensor_id=${sensorId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch history data');

        const result = await response.json();

        if (result.success) {
            currentPage = result.page;
            totalPages = result.total_pages;

            // Update table
            updateHistoryTable(result.data);

            // Update pagination
            updatePagination();
        }
    } catch (error) {
        console.error('Error fetching history data:', error);
        elements.historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">❌ Error loading data. Pastikan backend sudah running!</td>
            </tr>
        `;
    }
}

// Update history table
function updateHistoryTable(entries) {
    if (entries.length === 0) {
        elements.historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="loading">Tidak ada data</td>
            </tr>
        `;
        return;
    }

    elements.historyTableBody.innerHTML = entries.map(entry => {
        const timestamp = new Date(entry.timestamp);
        const date = timestamp.toLocaleDateString('id-ID');
        const time = timestamp.toLocaleTimeString('id-ID');

        return `
            <tr>
                <td>${entry.id}</td>
                <td><strong>${entry.sensor_id}</strong></td>
                <td>${date}</td>
                <td>${time}</td>
                <td>${entry.count}</td>
                <td>${entry.notes || '-'}</td>
            </tr>
        `;
    }).join('');
}

// Update weekly chart
function updateWeeklyChart(weeklyData) {
    const ctx = document.getElementById('weeklyChart').getContext('2d');

    // Prepare data
    const labels = weeklyData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    });

    const data = weeklyData.map(item => parseInt(item.total) || 0);

    // Destroy previous chart if exists
    if (weeklyChart) {
        weeklyChart.destroy();
    }

    // Create new chart
    weeklyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Deteksi',
                data: data,
                backgroundColor: 'rgba(42, 82, 152, 0.7)',
                borderColor: 'rgba(42, 82, 152, 1)',
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Deteksi: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update pagination controls
function updatePagination() {
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    elements.prevPage.disabled = currentPage <= 1;
    elements.nextPage.disabled = currentPage >= totalPages;
}

// Update API status indicator
function updateAPIStatus(connected) {
    if (connected) {
        elements.apiStatus.textContent = '🟢 Connected';
        elements.apiStatus.style.color = '#4caf50';
    } else {
        elements.apiStatus.textContent = '🔴 Disconnected';
        elements.apiStatus.style.color = '#f44336';
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    elements.lastUpdate.textContent = `Last update: ${now.toLocaleTimeString('id-ID')}`;
}

// Refresh all data
async function refreshData() {
    updateLastUpdateTime();
    await fetchDashboardData();
    await fetchHistoryData(currentPage);
}

// Event Listeners
elements.refreshBtn.addEventListener('click', refreshData);

elements.sensorFilter.addEventListener('change', () => {
    currentPage = 1;
    fetchHistoryData(1);
});

elements.prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchHistoryData(currentPage - 1);
    }
});

elements.nextPage.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchHistoryData(currentPage + 1);
    }
});

// Auto-refresh setiap 30 detik
setInterval(refreshData, 30000);

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard loaded');
    refreshData();
});
