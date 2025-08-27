// Global variables
        let stream = null;
        let isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        let dataAbsensi = [];
        let currentPage = 1;
        let itemsPerPage = 10;
        let filteredData = [];
        let isExporting = false;

        // Admin credentials
        const ADMIN_USERNAME = 'Admin';
        const ADMIN_PASSWORD = 'Admin999';

        // Initialize data from localStorage
        function initializeData() {
            try {
                const storedData = localStorage.getItem('absensiData');
                dataAbsensi = storedData ? JSON.parse(storedData) : [];
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
                dataAbsensi = [];
            }
        }

        // Save data to localStorage
        function saveData() {
            try {
                localStorage.setItem('absensiData', JSON.stringify(dataAbsensi));
            } catch (error) {
                console.error('Error saving data to localStorage:', error);
                alert('Gagal menyimpan data. Storage mungkin penuh.');
            }
        }

        // Update waktu real-time
        function updateDateTime() {
            try {
                const now = new Date();
                const options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Jakarta'
                };
                
                const currentDateTimeElement = document.getElementById('currentDateTime');
                if (currentDateTimeElement) {
                    currentDateTimeElement.textContent = now.toLocaleDateString('id-ID', options);
                }
                
                // Update waktu di form
                const timeOptions = {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Jakarta'
                };
                
                const waktuElement = document.getElementById('waktu');
                if (waktuElement) {
                    waktuElement.value = now.toLocaleTimeString('id-ID', timeOptions);
                }
            } catch (error) {
                console.error('Error updating date time:', error);
            }
        }

        // Check admin status on page load
        function checkAdminStatus() {
            const loginBtn = document.getElementById('loginBtn');
            const adminControls = document.getElementById('adminControls');
            const attendanceFormSection = document.getElementById('attendanceFormSection');
            const adminDashboard = document.getElementById('adminDashboard');
            
            if (isAdminLoggedIn) {
                // Hide login button and form, show admin controls and dashboard
                if (loginBtn) loginBtn.classList.add('hidden');
                if (adminControls) adminControls.classList.remove('hidden');
                if (attendanceFormSection) attendanceFormSection.classList.add('hidden');
                if (adminDashboard) adminDashboard.classList.remove('hidden');
                updateDatabase();
            } else {
                // Show login button and form, hide admin controls and dashboard
                if (loginBtn) loginBtn.classList.remove('hidden');
                if (adminControls) adminControls.classList.add('hidden');
                if (attendanceFormSection) attendanceFormSection.classList.remove('hidden');
                if (adminDashboard) adminDashboard.classList.add('hidden');
            }
        }

        // Show login modal
        function showLoginModal() {
            const modal = document.getElementById('loginModal');
            const errorDiv = document.getElementById('loginError');
            const form = document.getElementById('loginForm');
            
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
            if (errorDiv) errorDiv.classList.add('hidden');
            if (form) form.reset();
        }

        // Close login modal
        function closeLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        // Logout function
        function logout() {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                isAdminLoggedIn = false;
                localStorage.removeItem('adminLoggedIn');
                checkAdminStatus();
                alert('Logout berhasil!');
            }
        }

        // Camera functionality
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const capturedPhoto = document.getElementById('capturedPhoto');
        const startCameraBtn = document.getElementById('startCamera');
        const capturePhotoBtn = document.getElementById('capturePhoto');
        const retakePhotoBtn = document.getElementById('retakePhoto');
        const cameraPlaceholder = document.getElementById('cameraPlaceholder');
        const cameraControls = document.getElementById('cameraControls');
        const photoPreview = document.getElementById('photoPreview');
        const selfieDataInput = document.getElementById('selfieData');

        // Start camera
        async function startCamera() {
            try {
                // Stop any existing stream first
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
                
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    } 
                });
                
                if (video) {
                    video.srcObject = stream;
                    
                    // Show camera immediately
                    if (cameraPlaceholder) cameraPlaceholder.classList.add('hidden');
                    if (video) video.classList.remove('hidden');
                    if (cameraControls) cameraControls.classList.remove('hidden');
                    
                    // Ensure video is playing
                    await video.play();
                }
                
            } catch (err) {
                console.error('Error accessing camera:', err);
                alert('Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera dan coba lagi.');
                
                // Reset UI if camera fails
                if (cameraPlaceholder) cameraPlaceholder.classList.remove('hidden');
                if (video) video.classList.add('hidden');
                if (cameraControls) cameraControls.classList.add('hidden');
            }
        }

        // Capture photo
        function capturePhoto() {
            try {
                if (!video || !canvas) return;
                
                const context = canvas.getContext('2d');
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                context.drawImage(video, 0, 0);
                
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                
                if (imageData && imageData !== 'data:,') {
                    if (capturedPhoto) capturedPhoto.src = imageData;
                    if (selfieDataInput) selfieDataInput.value = imageData;
                    
                    // Hide video, show photo preview
                    if (video) video.classList.add('hidden');
                    if (photoPreview) photoPreview.classList.remove('hidden');
                    if (capturePhotoBtn) capturePhotoBtn.classList.add('hidden');
                    if (retakePhotoBtn) retakePhotoBtn.classList.remove('hidden');
                    
                    // Stop camera stream
                    if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                        stream = null;
                    }
                } else {
                    alert('Gagal mengambil foto. Coba lagi.');
                }
            } catch (err) {
                console.error('Error capturing photo:', err);
                alert('Terjadi kesalahan saat mengambil foto. Coba lagi.');
            }
        }

        // Retake photo
        function retakePhoto() {
            try {
                // Reset photo data
                if (photoPreview) photoPreview.classList.add('hidden');
                if (capturePhotoBtn) capturePhotoBtn.classList.remove('hidden');
                if (retakePhotoBtn) retakePhotoBtn.classList.add('hidden');
                if (selfieDataInput) selfieDataInput.value = '';
                if (capturedPhoto) capturedPhoto.src = '';
                
                // Show camera placeholder temporarily
                if (cameraPlaceholder) cameraPlaceholder.classList.remove('hidden');
                if (video) video.classList.add('hidden');
                if (cameraControls) cameraControls.classList.add('hidden');
                
                // Restart camera automatically
                setTimeout(() => {
                    startCamera();
                }, 100);
                
            } catch (err) {
                console.error('Error retaking photo:', err);
                // Fallback: show camera placeholder
                if (cameraPlaceholder) cameraPlaceholder.classList.remove('hidden');
                if (video) video.classList.add('hidden');
                if (cameraControls) cameraControls.classList.add('hidden');
            }
        }

        // Reset camera completely
        function resetCamera() {
            try {
                // Stop camera stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                    stream = null;
                }
                
                // Reset UI elements
                if (photoPreview) photoPreview.classList.add('hidden');
                if (cameraPlaceholder) cameraPlaceholder.classList.remove('hidden');
                if (video) {
                    video.classList.add('hidden');
                    video.srcObject = null;
                }
                if (cameraControls) cameraControls.classList.add('hidden');
                if (capturePhotoBtn) capturePhotoBtn.classList.remove('hidden');
                if (retakePhotoBtn) retakePhotoBtn.classList.add('hidden');
                if (selfieDataInput) selfieDataInput.value = '';
                if (capturedPhoto) capturedPhoto.src = '';
            } catch (error) {
                console.error('Error resetting camera:', error);
            }
        }

        // Get status color
        function getStatusColor(status) {
            switch(status) {
                case 'Absen Masuk': return 'bg-green-100 text-green-800';
                case 'Absen Pulang': return 'bg-blue-100 text-blue-800';
                case 'Izin Dinas': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        // Close modal
        function closeModal() {
            const modal = document.getElementById('successModal');
            if (modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }

        // Update statistics
        function updateStatistics() {
            try {
                const today = new Date();
                const todayStr = today.toLocaleDateString('id-ID');
                
                // Get week start (Monday)
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay() + 1);
                
                // Get month start
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                
                const todayCount = dataAbsensi.filter(item => item.tanggal === todayStr).length;
                const weekCount = dataAbsensi.filter(item => {
                    const itemDate = new Date(item.timestamp);
                    return itemDate >= weekStart;
                }).length;
                const monthCount = dataAbsensi.filter(item => {
                    const itemDate = new Date(item.timestamp);
                    return itemDate >= monthStart;
                }).length;
                
                const totalRecordsEl = document.getElementById('totalRecords');
                const todayRecordsEl = document.getElementById('todayRecords');
                const thisWeekRecordsEl = document.getElementById('thisWeekRecords');
                const thisMonthRecordsEl = document.getElementById('thisMonthRecords');
                
                if (totalRecordsEl) totalRecordsEl.textContent = dataAbsensi.length;
                if (todayRecordsEl) todayRecordsEl.textContent = todayCount;
                if (thisWeekRecordsEl) thisWeekRecordsEl.textContent = weekCount;
                if (thisMonthRecordsEl) thisMonthRecordsEl.textContent = monthCount;
            } catch (error) {
                console.error('Error updating statistics:', error);
            }
        }

        // Update filter options
        function updateFilterOptions() {
            try {
                const filterNama = document.getElementById('filterNama');
                if (!filterNama) return;
                
                const uniqueNames = [...new Set(dataAbsensi.map(item => item.nama))];
                
                filterNama.innerHTML = '<option value="">Semua Nama</option>';
                uniqueNames.forEach(name => {
                    if (name) {
                        filterNama.innerHTML += `<option value="${name}">${name}</option>`;
                    }
                });
            } catch (error) {
                console.error('Error updating filter options:', error);
            }
        }

        // Filter and display data
        function filterAndDisplayData() {
            try {
                const filterDate = document.getElementById('filterDate')?.value || '';
                const filterNama = document.getElementById('filterNama')?.value || '';
                const filterJenis = document.getElementById('filterJenis')?.value || '';
                
                filteredData = dataAbsensi.filter(item => {
                    let match = true;
                    
                    if (filterDate) {
                        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                        match = match && itemDate === filterDate;
                    }
                    
                    if (filterNama) {
                        match = match && item.nama === filterNama;
                    }
                    
                    if (filterJenis) {
                        match = match && item.jenisAbsensi === filterJenis;
                    }
                    
                    return match;
                });
                
                currentPage = 1; // Reset to first page when filtering
                displayTableData();
            } catch (error) {
                console.error('Error filtering data:', error);
            }
        }

        // Display table data
        function displayTableData() {
            try {
                const tableBody = document.getElementById('databaseTable');
                if (!tableBody) return;
                
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const pageData = filteredData.slice(startIndex, endIndex);
                
                if (pageData.length === 0) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="border border-gray-300 px-4 py-8 text-center text-gray-500">
                                ${filteredData.length === 0 ? 'Belum ada data dalam database' : 'Tidak ada data pada halaman ini'}
                            </td>
                        </tr>
                    `;
                } else {
                    tableBody.innerHTML = pageData.map((item, index) => `
                        <tr class="hover:bg-gray-50">
                            <td class="border border-gray-300 px-2 md:px-4 py-2">${startIndex + index + 1}</td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">${item.tanggal || '-'}</td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">${item.waktu || '-'}</td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">${item.nama || '-'}</td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">${item.jabatan || '-'}</td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">
                                <span class="px-2 py-1 rounded-full text-xs ${getStatusColor(item.jenisAbsensi)}">${item.jenisAbsensi || '-'}</span>
                            </td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">
                                ${item.selfieData ? `<img src="${item.selfieData}" class="w-8 md:w-12 h-8 md:h-12 rounded object-cover cursor-pointer" onclick="showPhotoModal('${item.selfieData}')" alt="Foto">` : '❌'}
                            </td>
                            <td class="border border-gray-300 px-2 md:px-4 py-2">
                                <button onclick="deleteRecord(${item.id})" class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors">
                                    🗑️ Hapus
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
                
                updatePagination();
            } catch (error) {
                console.error('Error displaying table data:', error);
            }
        }

        // Update pagination
        function updatePagination() {
            try {
                const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                const paginationInfo = document.getElementById('paginationInfo');
                const currentPageSpan = document.getElementById('currentPage');
                const prevBtn = document.getElementById('prevBtn');
                const nextBtn = document.getElementById('nextBtn');
                
                const startIndex = (currentPage - 1) * itemsPerPage + 1;
                const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
                
                if (paginationInfo) {
                    paginationInfo.textContent = `Menampilkan ${filteredData.length > 0 ? startIndex : 0} - ${endIndex} dari ${filteredData.length} data`;
                }
                if (currentPageSpan) {
                    currentPageSpan.textContent = currentPage;
                }
                
                if (prevBtn) {
                    prevBtn.disabled = currentPage <= 1;
                }
                if (nextBtn) {
                    nextBtn.disabled = currentPage >= totalPages || totalPages === 0;
                }
            } catch (error) {
                console.error('Error updating pagination:', error);
            }
        }

        // Change page
        function changePage(direction) {
            try {
                const totalPages = Math.ceil(filteredData.length / itemsPerPage);
                const newPage = currentPage + direction;
                
                if (newPage >= 1 && newPage <= totalPages) {
                    currentPage = newPage;
                    displayTableData();
                }
            } catch (error) {
                console.error('Error changing page:', error);
            }
        }

        // Delete record
        function deleteRecord(id) {
            try {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    dataAbsensi = dataAbsensi.filter(item => item.id !== id);
                    saveData();
                    updateDatabase();
                    alert('Data berhasil dihapus!');
                }
            } catch (error) {
                console.error('Error deleting record:', error);
                alert('Terjadi kesalahan saat menghapus data.');
            }
        }

        // Clear database
        function clearDatabase() {
            try {
                if (confirm('Apakah Anda yakin ingin menghapus SEMUA data absensi? Tindakan ini tidak dapat dibatalkan!')) {
                    if (confirm('Konfirmasi sekali lagi: HAPUS SEMUA DATA?')) {
                        dataAbsensi = [];
                        localStorage.removeItem('absensiData');
                        currentPage = 1;
                        updateDatabase();
                        alert('Semua data telah dihapus!');
                    }
                }
            } catch (error) {
                console.error('Error clearing database:', error);
                alert('Terjadi kesalahan saat menghapus data.');
            }
        }

        // Set export button states
        function setExportButtonStates(disabled) {
            const exportButtons = document.querySelectorAll('.export-btn');
            exportButtons.forEach(btn => {
                btn.disabled = disabled;
            });
        }

        // Export to CSV
        function exportToCSV() {
            if (isExporting) return;
            
            if (dataAbsensi.length === 0) {
                alert('Tidak ada data untuk diekspor!');
                return;
            }
            
            try {
                isExporting = true;
                setExportButtonStates(true);
                
                const headers = ['No', 'Tanggal', 'Waktu', 'Nama', 'Jabatan', 'Jenis Absensi', 'Timestamp'];
                const csvContent = [
                    headers.join(','),
                    ...dataAbsensi.map((item, index) => [
                        index + 1,
                        `"${item.tanggal || ''}"`,
                        `"${item.waktu || ''}"`,
                        `"${item.nama || ''}"`,
                        `"${item.jabatan || ''}"`,
                        `"${item.jenisAbsensi || ''}"`,
                        `"${item.timestamp || ''}"`
                    ].join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `absensi_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                alert('File CSV berhasil diunduh!');
            } catch (error) {
                console.error('Error exporting to CSV:', error);
                alert('Terjadi kesalahan saat mengekspor ke CSV.');
            } finally {
                isExporting = false;
                setExportButtonStates(false);
            }
        }

        // Export to Excel
        function exportToExcel() {
            if (isExporting) return;
            
            if (dataAbsensi.length === 0) {
                alert('Tidak ada data untuk diekspor!');
                return;
            }
            
            try {
                isExporting = true;
                setExportButtonStates(true);
                
                // Check if XLSX is available
                if (typeof XLSX === 'undefined') {
                    throw new Error('Library XLSX tidak tersedia');
                }
                
                // Prepare data for Excel
                const excelData = dataAbsensi.map((item, index) => ({
                    'No': index + 1,
                    'Tanggal': item.tanggal || '',
                    'Waktu': item.waktu || '',
                    'Nama': item.nama || '',
                    'Jabatan': item.jabatan || '',
                    'Jenis Absensi': item.jenisAbsensi || '',
                    'Timestamp': item.timestamp ? new Date(item.timestamp).toLocaleString('id-ID') : ''
                }));
                
                // Create workbook and worksheet
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(excelData);
                
                // Set column widths
                const colWidths = [
                    { wch: 5 },   // No
                    { wch: 12 },  // Tanggal
                    { wch: 10 },  // Waktu
                    { wch: 25 },  // Nama
                    { wch: 15 },  // Jabatan
                    { wch: 15 },  // Jenis Absensi
                    { wch: 20 }   // Timestamp
                ];
                ws['!cols'] = colWidths;
                
                // Add worksheet to workbook
                XLSX.utils.book_append_sheet(wb, ws, 'Data Absensi');
                
                // Generate filename
                const filename = `absensi_${new Date().toISOString().split('T')[0]}.xlsx`;
                
                // Save file
                XLSX.writeFile(wb, filename);
                
                alert('File Excel berhasil diunduh!');
            } catch (error) {
                console.error('Error exporting to Excel:', error);
                alert('Terjadi kesalahan saat mengekspor ke Excel. Pastikan browser Anda mendukung fitur ini.');
            } finally {
                isExporting = false;
                setExportButtonStates(false);
            }
        }

        // Export to PDF
        function exportToPDF() {
            if (isExporting) return;
            
            if (dataAbsensi.length === 0) {
                alert('Tidak ada data untuk diekspor!');
                return;
            }
            
            try {
                isExporting = true;
                setExportButtonStates(true);
                
                // Check if jsPDF is available
                if (typeof window.jspdf === 'undefined') {
                    throw new Error('Library jsPDF tidak tersedia');
                }
                
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Add title
                doc.setFontSize(16);
                doc.setFont(undefined, 'bold');
                doc.text('LAPORAN DATA ABSENSI', 105, 20, { align: 'center' });
                doc.text('SMK YPPM TOMO', 105, 30, { align: 'center' });
                
                // Add generation date
                doc.setFontSize(10);
                doc.setFont(undefined, 'normal');
                doc.text(`Digenerate pada: ${new Date().toLocaleString('id-ID')}`, 20, 45);
                
                // Prepare table data
                const tableData = dataAbsensi.map((item, index) => [
                    index + 1,
                    item.tanggal || '-',
                    item.waktu || '-',
                    item.nama || '-',
                    item.jabatan || '-',
                    item.jenisAbsensi || '-'
                ]);
                
                // Add table
                doc.autoTable({
                    head: [['No', 'Tanggal', 'Waktu', 'Nama', 'Jabatan', 'Jenis Absensi']],
                    body: tableData,
                    startY: 55,
                    styles: {
                        fontSize: 8,
                        cellPadding: 3
                    },
                    headStyles: {
                        fillColor: [66, 139, 202],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    columnStyles: {
                        0: { cellWidth: 15, halign: 'center' }, // No
                        1: { cellWidth: 25 }, // Tanggal
                        2: { cellWidth: 20 }, // Waktu
                        3: { cellWidth: 50 }, // Nama
                        4: { cellWidth: 30 }, // Jabatan
                        5: { cellWidth: 35 }  // Jenis Absensi
                    },
                    margin: { left: 15, right: 15 }
                });
                
                // Add footer
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
                    doc.text(`Total Data: ${dataAbsensi.length} record`, 20, 285);
                }
                
                // Save PDF
                const filename = `absensi_${new Date().toISOString().split('T')[0]}.pdf`;
                doc.save(filename);
                
                alert('File PDF berhasil diunduh!');
            } catch (error) {
                console.error('Error exporting to PDF:', error);
                alert('Terjadi kesalahan saat mengekspor ke PDF. Pastikan browser Anda mendukung fitur ini.');
            } finally {
                isExporting = false;
                setExportButtonStates(false);
            }
        }

        // Export to JSON
        function exportToJSON() {
            if (isExporting) return;
            
            if (dataAbsensi.length === 0) {
                alert('Tidak ada data untuk diekspor!');
                return;
            }
            
            try {
                isExporting = true;
                setExportButtonStates(true);
                
                const jsonContent = JSON.stringify(dataAbsensi, null, 2);
                const blob = new Blob([jsonContent], { type: 'application/json' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `absensi_${new Date().toISOString().split('T')[0]}.json`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                alert('File JSON berhasil diunduh!');
            } catch (error) {
                console.error('Error exporting to JSON:', error);
                alert('Terjadi kesalahan saat mengekspor ke JSON.');
            } finally {
                isExporting = false;
                setExportButtonStates(false);
            }
        }

        // Show photo modal
        function showPhotoModal(imageSrc) {
            try {
                const modal = document.getElementById('photoModal');
                const modalPhoto = document.getElementById('modalPhoto');
                
                if (modal && modalPhoto && imageSrc) {
                    modalPhoto.src = imageSrc;
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            } catch (error) {
                console.error('Error showing photo modal:', error);
            }
        }

        // Close photo modal
        function closePhotoModal() {
            try {
                const modal = document.getElementById('photoModal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                }
            } catch (error) {
                console.error('Error closing photo modal:', error);
            }
        }

        // Update database
        function updateDatabase() {
            try {
                updateStatistics();
                updateFilterOptions();
                filterAndDisplayData();
            } catch (error) {
                console.error('Error updating database:', error);
            }
        }

        // Initialize page
        function initializePage() {
            try {
                initializeData();
                checkAdminStatus();
                updateDateTime();
                
                // Set up real-time clock
                setInterval(updateDateTime, 1000);
                
                // Set up event listeners
                setupEventListeners();
            } catch (error) {
                console.error('Error initializing page:', error);
            }
        }

        // Setup event listeners
        function setupEventListeners() {
            try {
                // Camera buttons
                if (startCameraBtn) {
                    startCameraBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        startCamera();
                    });
                }
                
                if (capturePhotoBtn) {
                    capturePhotoBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        capturePhoto();
                    });
                }
                
                if (retakePhotoBtn) {
                    retakePhotoBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        retakePhoto();
                    });
                }

                // Form submission
                const absensiForm = document.getElementById('absensiForm');
                if (absensiForm) {
                    absensiForm.addEventListener('submit', handleFormSubmission);
                }

                // Login form
                const loginForm = document.getElementById('loginForm');
                if (loginForm) {
                    loginForm.addEventListener('submit', handleLogin);
                }

                // Filter event listeners
                const filterDate = document.getElementById('filterDate');
                const filterNama = document.getElementById('filterNama');
                const filterJenis = document.getElementById('filterJenis');
                
                if (filterDate) filterDate.addEventListener('change', filterAndDisplayData);
                if (filterNama) filterNama.addEventListener('change', filterAndDisplayData);
                if (filterJenis) filterJenis.addEventListener('change', filterAndDisplayData);

                // Modal event listeners
                const successModal = document.getElementById('successModal');
                const loginModal = document.getElementById('loginModal');
                const photoModal = document.getElementById('photoModal');
                
                if (successModal) {
                    successModal.addEventListener('click', function(e) {
                        if (e.target === this) closeModal();
                    });
                }
                
                if (loginModal) {
                    loginModal.addEventListener('click', function(e) {
                        if (e.target === this) closeLoginModal();
                    });
                }
                
                if (photoModal) {
                    photoModal.addEventListener('click', function(e) {
                        if (e.target === this) closePhotoModal();
                    });
                }

                // Keyboard event listeners
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape') {
                        if (successModal && !successModal.classList.contains('hidden')) {
                            closeModal();
                        }
                        if (loginModal && !loginModal.classList.contains('hidden')) {
                            closeLoginModal();
                        }
                        if (photoModal && !photoModal.classList.contains('hidden')) {
                            closePhotoModal();
                        }
                    }
                });
            } catch (error) {
                console.error('Error setting up event listeners:', error);
            }
        }

        // Handle form submission
        function handleFormSubmission(e) {
            e.preventDefault();
            
            try {
                const submitBtn = document.getElementById('submitButton');
                const submitText = document.getElementById('submitText');
                const loadingText = document.getElementById('loadingText');
                
                // Validate required fields
                const nama = document.getElementById('nama')?.value?.trim() || '';
                const jabatan = document.getElementById('jabatan')?.value?.trim() || '';
                const jenisAbsensi = document.getElementById('jenisAbsensi')?.value?.trim() || '';
                const selfieData = document.getElementById('selfieData')?.value?.trim() || '';
                
                if (!nama || !jabatan || !jenisAbsensi) {
                    alert('Mohon lengkapi semua data yang diperlukan!');
                    return;
                }
                
                if (!selfieData) {
                    alert('Mohon ambil foto selfie terlebih dahulu!');
                    return;
                }
                
                // Show loading
                if (submitText) submitText.classList.add('hidden');
                if (loadingText) loadingText.classList.remove('hidden');
                if (submitBtn) submitBtn.disabled = true;
                
                // Simulate processing
                setTimeout(() => {
                    try {
                        const waktu = document.getElementById('waktu')?.value || '';
                        
                        const absensiData = {
                            id: Date.now(),
                            nama: nama,
                            jabatan: jabatan,
                            jenisAbsensi: jenisAbsensi,
                            waktu: waktu,
                            selfieData: selfieData,
                            tanggal: new Date().toLocaleDateString('id-ID'),
                            timestamp: new Date().toISOString()
                        };
                        
                        // Save to array and localStorage
                        dataAbsensi.unshift(absensiData);
                        saveData();
                        
                        // Reset form
                        e.target.reset();
                        resetCamera();
                        
                        // Show success modal
                        const successModal = document.getElementById('successModal');
                        if (successModal) {
                            successModal.classList.remove('hidden');
                            successModal.classList.add('flex');
                        }
                        
                        // Update admin database if logged in
                        if (isAdminLoggedIn) {
                            updateDatabase();
                        }
                        
                    } catch (error) {
                        console.error('Error processing form:', error);
                        alert('Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
                    } finally {
                        // Reset button
                        if (submitText) submitText.classList.remove('hidden');
                        if (loadingText) loadingText.classList.add('hidden');
                        if (submitBtn) submitBtn.disabled = false;
                    }
                }, 1500);
                
            } catch (error) {
                console.error('Error handling form submission:', error);
                alert('Terjadi kesalahan. Silakan coba lagi.');
                
                // Reset button state
                const submitText = document.getElementById('submitText');
                const loadingText = document.getElementById('loadingText');
                const submitBtn = document.getElementById('submitButton');
                
                if (submitText) submitText.classList.remove('hidden');
                if (loadingText) loadingText.classList.add('hidden');
                if (submitBtn) submitBtn.disabled = false;
            }
        }

        // Handle login
        function handleLogin(e) {
            e.preventDefault();
            
            try {
                const username = document.getElementById('username')?.value?.trim() || '';
                const password = document.getElementById('password')?.value?.trim() || '';
                const errorDiv = document.getElementById('loginError');
                
                if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                    // Login successful
                    isAdminLoggedIn = true;
                    localStorage.setItem('adminLoggedIn', 'true');
                    closeLoginModal();
                    checkAdminStatus();
                    
                    // Show success message
                    setTimeout(() => {
                        alert('Login berhasil! Selamat datang, Admin.');
                    }, 100);
                } else {
                    // Login failed
                    if (errorDiv) errorDiv.classList.remove('hidden');
                    const passwordField = document.getElementById('password');
                    if (passwordField) passwordField.value = '';
                }
            } catch (error) {
                console.error('Error handling login:', error);
                alert('Terjadi kesalahan saat login. Silakan coba lagi.');
            }
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initializePage);

        // Initialize immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializePage);
        } else {
            initializePage();
        }

        (function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'9757db07e1725fea',t:'MTc1NjI1ODc3MS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();