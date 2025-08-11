 let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let notices = JSON.parse(localStorage.getItem('collegeNotices')) || [];
        let facultyData = JSON.parse(localStorage.getItem('facultyData')) || [];
        let facultyAllocations = JSON.parse(localStorage.getItem('facultyAllocations')) || [];
        let currentEditingFaculty = null;

        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'index.html';
        }

        function logout() {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }

        function switchTab(tabName) {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'overview') {
                updateOverviewStats();
                loadRecentNotices();
            } else if (tabName === 'notices') {
                loadAllNotices();
            } else if (tabName === 'faculty') {
                loadFacultyTable();
            } else if (tabName === 'allocate') {
                loadAllocationPage();
            }
        }

        function updateOverviewStats() {
            const total = notices.length;
            const highPriority = notices.filter(n => n.priority === 'high').length;
            const today = new Date().toDateString();
            const todayCount = notices.filter(n => new Date(n.date).toDateString() === today).length;
            const facultyCount = facultyData.length;

            document.getElementById('totalNoticesCount').textContent = total;
            document.getElementById('totalFacultyCount').textContent = facultyCount;
            document.getElementById('highPriorityNotices').textContent = highPriority;
            document.getElementById('todayNoticesCount').textContent = todayCount;
        }

        function loadRecentNotices() {
            const recentNotices = notices.slice(0, 10);
            const tableBody = document.getElementById('recentNoticesTable');
            
            tableBody.innerHTML = recentNotices.map(notice => `
                <tr>
                    <td>${notice.title}</td>
                    <td>${notice.author}</td>
                    <td>${notice.department}</td>
                    <td><span class="priority-badge priority-${notice.priority}">${notice.priority.toUpperCase()}</span></td>
                    <td>${formatDate(notice.date)}</td>
                </tr>
            `).join('');
        }

        function loadAllNotices() {
            const tableBody = document.getElementById('allNoticesTable');
            
            tableBody.innerHTML = notices.map(notice => `
                <tr>
                    <td>${notice.title}</td>
                    <td>${notice.author}</td>
                    <td>${notice.category}</td>
                    <td><span class="priority-badge priority-${notice.priority}">${notice.priority.toUpperCase()}</span></td>
                    <td>${notice.targetAudience === 'all' ? 'All Students' : notice.targetAudience === 'department' ? 'Department' : 'Subject'}</td>
                    <td>${formatDate(notice.date)}</td>
                    <td>
                        <button class="action-btn delete-btn" onclick="deleteNotice('${notice.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        function loadFacultyTable() {
            const tableBody = document.getElementById('facultyTable');
            
            tableBody.innerHTML = facultyData.map(faculty => `
                <tr>
                    <td>${faculty.name}</td>
                    <td>${faculty.department}</td>
                    <td>${faculty.subjects.join(', ')}</td>
                    <td>${faculty.email}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editFaculty('${faculty.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteFaculty('${faculty.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        function loadAllocationPage() {
            const facultySelect = document.getElementById('allocateFaculty');
            const noticeSelect = document.getElementById('allocateNotice');
            
            facultySelect.innerHTML = '<option value="">Select Faculty</option>';
            facultyData.forEach(faculty => {
                const option = document.createElement('option');
                option.value = faculty.id;
                option.textContent = `${faculty.name} (${faculty.department})`;
                facultySelect.appendChild(option);
            });
            
            noticeSelect.innerHTML = '<option value="">Select Notice</option>';
            notices.forEach(notice => {
                const option = document.createElement('option');
                option.value = notice.id;
                option.textContent = notice.title;
                noticeSelect.appendChild(option);
            });
            
            loadFacultyAllocationGrid();
        }

        function loadFacultyAllocationGrid() {
            const grid = document.getElementById('facultyAllocationGrid');
            
            grid.innerHTML = facultyData.map(faculty => {
                const allocatedNotices = facultyAllocations.filter(a => a.facultyId === faculty.id);
                return `
                    <div class="faculty-card">
                        <h4>${faculty.name}</h4>
                        <p><strong>Department:</strong> ${faculty.department}</p>
                        <p><strong>Subjects:</strong> ${faculty.subjects.join(', ')}</p>
                        <p><strong>Allocated Notices:</strong> ${allocatedNotices.length}</p>
                        <div style="margin-top: 10px;">
                            ${allocatedNotices.map(allocation => {
                                const notice = notices.find(n => n.id === allocation.noticeId);
                                return notice ? `<small style="display: block; color: #666;">• ${notice.title}</small>` : '';
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function allocateNotice() {
            const facultyId = document.getElementById('allocateFaculty').value;
            const noticeId = document.getElementById('allocateNotice').value;
            
            if (!facultyId || !noticeId) {
                alert('Please select both faculty and notice');
                return;
            }
            
            const existingAllocation = facultyAllocations.find(a => a.facultyId === facultyId && a.noticeId === noticeId);
            if (existingAllocation) {
                alert('This notice is already allocated to the selected faculty');
                return;
            }
            
            facultyAllocations.push({
                id: generateId(),
                facultyId: facultyId,
                noticeId: noticeId,
                allocatedDate: new Date().toISOString()
            });
            
            localStorage.setItem('facultyAllocations', JSON.stringify(facultyAllocations));
            loadFacultyAllocationGrid();
            
            document.getElementById('allocateFaculty').value = '';
            document.getElementById('allocateNotice').value = '';
            
            alert('Notice allocated successfully!');
        }

        function openNoticeModal() {
            document.getElementById('noticeModal').style.display = 'block';
        }

        function closeNoticeModal() {
            document.getElementById('noticeModal').style.display = 'none';
            document.getElementById('adminNoticeForm').reset();
            document.getElementById('adminDepartmentGroup').style.display = 'none';
        }

        function openFacultyModal() {
            currentEditingFaculty = null;
            document.getElementById('facultyModalTitle').textContent = 'Add New Faculty';
            document.getElementById('facultySubmitBtn').textContent = 'Add Faculty';
            document.getElementById('facultyModal').style.display = 'block';
        }

        function closeFacultyModal() {
            document.getElementById('facultyModal').style.display = 'none';
            document.getElementById('facultyForm').reset();
            currentEditingFaculty = null;
        }

        function editFaculty(id) {
            const faculty = facultyData.find(f => f.id === id);
            if (faculty) {
                currentEditingFaculty = faculty;
                document.getElementById('facultyModalTitle').textContent = 'Edit Faculty';
                document.getElementById('facultySubmitBtn').textContent = 'Update Faculty';
                document.getElementById('facultyName').value = faculty.name;
                document.getElementById('facultyDepartment').value = faculty.department;
                document.getElementById('facultySubjects').value = faculty.subjects.join(', ');
                document.getElementById('facultyEmail').value = faculty.email;
                document.getElementById('facultyModal').style.display = 'block';
            }
        }

        function deleteFaculty(id) {
            if (confirm('Are you sure you want to delete this faculty member?')) {
                facultyData = facultyData.filter(f => f.id !== id);
                facultyAllocations = facultyAllocations.filter(a => a.facultyId !== id);
                localStorage.setItem('facultyData', JSON.stringify(facultyData));
                localStorage.setItem('facultyAllocations', JSON.stringify(facultyAllocations));
                loadFacultyTable();
                updateOverviewStats();
            }
        }

        function deleteNotice(id) {
            if (confirm('Are you sure you want to delete this notice?')) {
                notices = notices.filter(notice => notice.id !== id);
                facultyAllocations = facultyAllocations.filter(a => a.noticeId !== id);
                localStorage.setItem('collegeNotices', JSON.stringify(notices));
                localStorage.setItem('facultyAllocations', JSON.stringify(facultyAllocations));
                loadAllNotices();
                updateOverviewStats();
            }
        }

        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function formatDate(date) {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        document.getElementById('adminTargetAudience').addEventListener('change', function() {
            const departmentGroup = document.getElementById('adminDepartmentGroup');
            if (this.value === 'department') {
                departmentGroup.style.display = 'block';
            } else {
                departmentGroup.style.display = 'none';
            }
        });

        document.getElementById('adminNoticeForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('adminNoticeTitle').value;
            const content = document.getElementById('adminNoticeContent').value;
            const category = document.getElementById('adminNoticeCategory').value;
            const priority = document.getElementById('adminNoticePriority').value;
            const targetAudience = document.getElementById('adminTargetAudience').value;
            const department = document.getElementById('adminNoticeDepartment').value;

            const notice = {
                id: generateId(),
                title: title,
                content: content,
                category: category,
                priority: priority,
                date: new Date().toISOString(),
                author: 'Admin',
                department: targetAudience === 'department' ? department : 'All',
                targetAudience: targetAudience
            };
            
            notices.unshift(notice);
            localStorage.setItem('collegeNotices', JSON.stringify(notices));
            closeNoticeModal();
            loadAllNotices();
            updateOverviewStats();
        });

        document.getElementById('facultyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('facultyName').value;
            const department = document.getElementById('facultyDepartment').value;
            const subjects = document.getElementById('facultySubjects').value.split(',').map(s => s.trim());
            const email = document.getElementById('facultyEmail').value;

            if (currentEditingFaculty) {
                const index = facultyData.findIndex(f => f.id === currentEditingFaculty.id);
                facultyData[index] = {
                    ...currentEditingFaculty,
                    name: name,
                    department: department,
                    subjects: subjects,
                    email: email
                };
            } else {
                const faculty = {
                    id: generateId(),
                    name: name,
                    department: department,
                    subjects: subjects,
                    email: email
                };
                facultyData.push(faculty);
            }
            
            localStorage.setItem('facultyData', JSON.stringify(facultyData));
            closeFacultyModal();
            loadFacultyTable();
            updateOverviewStats();
        });

        window.addEventListener('click', function(e) {
            const noticeModal = document.getElementById('noticeModal');
            const facultyModal = document.getElementById('facultyModal');
            if (e.target === noticeModal) {
                closeNoticeModal();
            }
            if (e.target === facultyModal) {
                closeFacultyModal();
            }
        });

        document.getElementById('userInfo').innerHTML = `
            <div><strong>${currentUser.name}</strong></div>
            <div>System Administrator</div>
        `;

        updateOverviewStats();
        loadRecentNotices();